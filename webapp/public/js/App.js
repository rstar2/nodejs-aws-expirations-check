const App = {
    template: html`
    <div class="md-layout">
        <md-toolbar class="md-layout-item md-size-100 md-dense">
            <div class="md-toolbar-section-start">
                <h3 class="md-title">Expirations list</h3>
            </div>
            <div class="md-toolbar-section-end">
                <md-button @click="apiRefresh" class="md-primary md-raised">Refresh</md-button>
                <md-button @click="showDialogAdd = true" class="md-primary md-raised">Add</md-button>
            </div>
        </md-toolbar>
    
        <md-list class="md-layout-item md-size-100">
            <md-list-item v-for="item in list" :key="item.id">
                <span class="md-list-item-text">{{item.expiresAt | date}}</span>
                <span class="md-list-item-text">{{item.name}}</span>
                <md-button @click="updateItem = item" class="md-default md-raised md-list-action">Update</md-button>
                <md-button @click="apiDelete(item.id)" class="md-accent md-raised md-list-action">Delete</md-button>
            </md-list-item>
        </md-list>
    
        <app-dialog-add v-model:show="showDialogAdd" :show-item="updateItem" @action="apiAddUpdate">
        </app-dialog-add>
    
        <app-notifications v-model="info"></app-notifications>
    </div>
    `,
    components: {
        'app-dialog-add': DialogAdd,
        'app-notifications': Notifications,
    },
    filters: {
        /**
         * @param {Number|String} expiresAt 
         */
        date(expiresAt) {
            // make it to Number
            expiresAt = +expiresAt;
            if (!expiresAt) return '';
            // make it to Date
            const dt = new Date(expiresAt);
            return dt.toLocaleDateString();
        }
    },
    data() {
        return {
            // describes the current list
            list: [{
                id: "asdasd",
                expiresAt: 1539637200000,
                name: "test"
            }],

            // describes the notification result info to show (e.g. result of the api call)
            info: null,

            // describes whether to open/show the DialogAdd/Update
            showDialogAdd: false,
            updateItem: null,
        };
    },
    watch: {
        showDialogAdd(newValue) {
            if (!newValue) {
                this.updateItem = null;
            }
        },
        updateItem(newValue) {
            if (newValue) {
                this.showDialogAdd = true;
            }
        }
    },
    methods: {
        apiRefresh() {
            api(`${APP_CONTEXT_PATH}/api/list`)
                .then(data => this.list = data.Items)
                .then(() => this.info = 'Refreshed');
        },
        apiAdd({ name, expiresAt }) {
            api(`${APP_CONTEXT_PATH}/api/add`, { name, expiresAt })
                .then(data => data.Item)
                .then(Item => this.list = [...this.list, Item])
                .then(() => this.info = 'Added');
        },
        apiDelete(id) {  // delete is reserved JS keyword
            api(`${APP_CONTEXT_PATH}/api/delete`, { id })
                .then(data => data.id)
                .then(ItemId => this.list = this.list.filter(item => item.id !== ItemId))
                .then(() => this.info = 'Deleted');
        },
        apiUpdate({ id, name, expiresAt }) {  // delete is reserved JS keyword
            api(`${APP_CONTEXT_PATH}/api/update`, { id, name, expiresAt })
                .then(data => data.Item)
                .then(Item => this.list = this.list.filter(item => item.id !== Item.id))
                .then(() => this.info = 'Updated');
        },
        apiAddUpdate(item) {
            if (item.id) {
                this.apiUpdate(item);
            } else {
                this.apiAdd(item);
            }
        }
    },
    mounted() {
    },
};
