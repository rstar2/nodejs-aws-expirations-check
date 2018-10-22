Vue.use(window.vuelidate.default);
const { required, minLength } = window.validators;

const DialogAdd = {
    template: html`
    <md-dialog :md-active.sync="active">
        <md-dialog-title> {{ title }} </md-dialog-title>
    
        <md-dialog-content>
            <!-- <form novalidate class="md-layout" @submit.prevent="validateAdd"> -->
    
            <md-field :class="validateClass('name')">
                <label>Name</label>
                <md-input v-model="item.name"></md-input>
                <span class="md-error" v-if="!$v.item.name.required">The name is required</span>
                <span class="md-error" v-else-if="!$v.item.name.minlength">Name must have at least
                    {{$v.item.name.$params.minLength.min}} letters.</span>
            </md-field>
    
            <md-datepicker v-model="item.expiresAtDate" md-immediately :class="validateClass('expiresAtDate')">
                <label>Expires At</label>
                <span class="md-error" v-if="!$v.item.expiresAtDate.required">The expire-date is required</span>
            </md-datepicker>
    
            <md-dialog-actions>
                <md-button class="md-primary" @click="active = false">Close</md-button>
                <md-button type="submit" class="md-primary" @click="doAction" :disabled="disabled"> {{ action }}
                </md-button>
            </md-dialog-actions>
    
            <!-- </form> -->
        </md-dialog-content>
    </md-dialog>
    `,

    props: {
        'show': { type: Boolean, default: false },
        'showItem': { type: Object, default: {} },
    },
    model: {
        prop: 'show',
        event: 'close'
    },
    computed: {
        title() {
            return this.showItem ? 'Update expiration-check item' : 'Add new expiration-check item';
        },
        action() {
            return this.showItem ? 'Update' : 'Add';
        },
        'active': {
            // getter
            get: function () {
                return !!this.show;
            },
            // setter
            set: function (newValue) {
                if (!newValue) {
                    this.$emit('close');
                }
            }
        },
        disabled() {
            return false;
            // return this.$v.item.$invalid;
        }
    },
    data() {
        return {
            item: {
                name: null,
                expiresAt: null,
                expiresAtDate: null,
            },
        };
    },
    watch: {
        // TODO: fix the mess
        showItem(newValue) {
            this.item = newValue ? Object.assign(this.item, newValue) : {};

        },
        'item.name': function (newValue, oldValue) {
            console.log("Name",  this.item.name)
        },
        'item.expiresAt': function (expiresAt, old) {
            if (expiresAt === old) return;

            // 'expiresAt' is Number object, so create a 'expiresAtDate' as Date 
            this.item.expiresAtDate = expiresAt ? new Date(expiresAt) : null;
        },
        // watch a nested property
        'item.expiresAtDate': function (expiresAtDate, old) {
            if (expiresAtDate === old) return;

            // 'expiresAtDate' is Date object, so create a 'expiresAt' as Number 
            this.item.expiresAt = expiresAtDate ? expiresAtDate.getTime() : null;
        }
    },
    methods: {
        doAction() {
            // validate first and if any invalid field then return
            this.$v.item.$touch();

            if (this.$v.item.$invalid) {
                // validation errors are shown already when this.$v.item.$touch() is called
                return;
            }

            const item = this.item;

            this.item = {};
            this.$v.item.$reset();

            this.active = false;

            this.$emit('action', item);
        },

        validateClass(fieldName) {
            const field = this.$v.item[fieldName];

            if (field) {
                return {
                    'md-invalid': field.$invalid && field.$dirty
                };
            }
            return null;
        },

    },

    // Vuelidate integration
    validations: {
        'item': {
            'name': {
                required,
                minLength: minLength(5)
            },
            'expiresAtDate': {
                required,
            }
        }

    },


};
