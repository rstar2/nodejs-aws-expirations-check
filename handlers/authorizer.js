const jwt = require('../utils/jwt')(process.env.JWT_SECRET);



// For Lambda authorizers of the TOKEN type, API Gateway passes the source token to the Lambda function as the event.authorizationToken.
// Based on the value of this token, the preceding authorizer function returns an Allow IAM policy on a specified method
// if the token value is 'allow'. This permits a caller to invoke the specified method.
// The caller receives a 200 OK response. The authorizer function returns a Deny policy against the specified method
// if the authorization token has a 'deny' value. This blocks the caller from calling the method.
// The client receives a 403 Forbidden response. If the token is 'unauthorized', the client receives a 401 Unauthorized response.
// If the token is 'fail' or anything else, the client receives a 500 Internal Server Error response.
// In both of the last two cases, no IAM policy is generated and the calls fail.
module.exports.handler = async (event, context, callback) => {
    // console.log('AUTH: Check');
    // console.log(event);
    // it's of the type if we send HTTP header "Authorization: Bearer 4674cc54-bd05-11e7-abc4-cec278b6b50b"
    // { 
    //     type: 'TOKEN',
    //     methodArn: 'arn:aws:execute-api:eu-west-1:592755008084:0hg9u4bp35/dev/GET/api/check',
    //     authorizationToken: 'Bearer 4674cc54-bd05-11e7-abc4-cec278b6b50b'
    // }   

    // Get Token
    if (typeof event.authorizationToken === 'undefined') {
        console.log('AUTH: No token');
        // Return a 401 Unauthorized response
        return callback('Unauthorized: No token');
    }

    const split = event.authorizationToken.split('Bearer');
    if (split.length !== 2) {
        console.log('AUTH: no token in Bearer');
        // Return a 401 Unauthorized response
        return callback('Unauthorized: No token in Bearer');
    }
    
    const token = split[1].trim().toLowerCase();

    // with Node8.10 Lambda we can return directly a promise
    // https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
    return authorizeDummy(token, event.methodArn)
        .then((policy => {
            console.log(`Authorized call with token ${token} for ${policy.principalId}`);
            return policy;
        }))
        .catch(err => {
            console.log(`Unauthorized call for token ${token}`);
            throw 'Unauthorized: ' + err;
        });

    // for Node6.10 - just call the callback
    // try {
    //     const policy = await authorizeDummy(token, event.methodArn);
    //     console.log(`Authorized call with token ${token} for ${policy.principalId}`);
    //     callback(null, policy);
    // } catch (err) {
    //     console.log(`Unauthorized call for token ${token}`);
    //     callback('Unauthorized: ' + err);
    // }
};

/**
 * @param {String} token 
 * @return {Promise} 
 */
const authorizeDummy = (token, resource) => {
    return new Promise((resolve, reject) => {
        /*
         * extra custom authorization logic here: OAUTH, JWT ... etc
         * search token in database and check if valid
         * here for demo purpose we will just compare with hardcoded value
         */
        switch (token) {
            case '4674cc54-bd05-11e7-abc4-cec278b6b50a':
                resolve(generateAllow('user123', resource));
                break;
            case '4674cc54-bd05-11e7-abc4-cec278b6b50b':
                resolve(generateDeny('user456', resource));
                break;
            default:
                reject('Not allowed token: ' + token);
        }
    });
};

/**
 * @param {String} token 
 * @return {Promise} 
 */
const authorizeJWT = (jsonWebToken, resource) => {
    return jwt.verify(jsonWebToken).then(id => {
        if (!id) throw 'No id decoded from the JWT';

        switch (id) {
            case 'user123':
                return generateAllow(id, resource);
            default:
                return generateDeny(id, resource);
        }
    });
};

const EFFECT_ALLOW = 'Allow';
const EFFECT_DENY = 'Deny';

const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {
        principalId,
    };

    if (effect && resource) {
        const policyDocument = {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        };
        //Object.assign(authResponse, { policyDocument, });
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        'stringKey': 'stringval',
        'numberKey': 123,
        'booleanKey': true,
    };
    // These keys can be accessed in the backend Lambda function as part of the input event
    // $event.requestContext.authorizer.<key>.
    // BUT their values are stringified, for example, "stringval", "123", or "true", respectively.

    return authResponse;
};

const generateAllow = (principalId, resource) => {
    return generatePolicy(principalId, EFFECT_ALLOW, resource);
};

const generateDeny = (principalId, resource) => {
    return generatePolicy(principalId, EFFECT_DENY, resource);
};