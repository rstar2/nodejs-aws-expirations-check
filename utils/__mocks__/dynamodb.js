
let mockItems = [
    {
        id: 0,
        user: 'TESTER',
        name: 'Expires 8 days before today',
        expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
    {
        id: 1,
        user: 'TESTER',
        name: 'Expires 6 days before today ',
        expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    },
    {
        id: 2,
        user: 'TESTER',
        name: 'Expires today',
        expiresAt: Date.now(),
    },
    {
        id: 3,
        user: 'TESTER',
        name: 'Expires 6 days before today ',
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 6,
    },
    {
        id: 4,
        user: 'TESTER',
        name: 'Expires 8 days after today',
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 8,
    },
];

module.exports = (region) => {

    return {
        /**
		 * 
		 * @param {String} action
		 * @param {Object} params
		 * @returns {Promise}
		 */
        exec(action, params) {
            let result;
            switch (action) {
                case 'scan':
                    // return all items
                    result = { 'Items': mockItems, 'Count': mockItems.length, 'ScannedCount': mockItems.length, };
                    break;
                case 'put':
                    mockItems.push(params.Item);
                    result = `Inserted item with id ${params.Item.id}`;
                    break;
                case 'delete': {
                    const id = params.Key.id;
                    const index = mockItems.findIndex(item => item.id === id);
                    if (index >= 0) {
                        mockItems.splice(index, 1);
                        result = `Deleted item with id ${id}`;
                    }
                    break;
                }
                default:
                    throw new Error(`Unknown DynamoDB action  ${action}`);
            }
            return Promise.resolve(result);
        },
    };
};

/**
 * Can be used to set mock items that the module will return.
 * 
 * Usage:
 * jest.mock('../utils/dynamodb');
 * const dynamodb-utils = require('../utils/dynamodb');
 * dynamodb-utils.__setMockItems(...);
 * dynamodb-utils(region).exec(action, params)
 * 
 * 
 * @param {Array} items 
 */
module.exports.__setMockItems = (items) => {
    mockItems = items;
};

