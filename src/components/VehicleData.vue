<!-- Copyright (c) 2018, Livio, Inc. -->
<template>
    <div class="container-fluid color-bg-gray">
        <div class="row">

            <page-side-nav/>
            <page-user-nav/>

            <main class="col-sm-9 ml-sm-auto col-md-10 pt-3 main-content" role="main">
                <b-form-radio-group id="selectEnvironment"
                                    buttons
                                    button-variant="toggle"
                                    v-on:change="environmentClick"
                                    v-model="environment"
                                    :options="environmentOptions"
                                    name="chooseEnvironment"/>

                <div class="pull-right">
                    <b-btn v-if="environment == 'STAGING' && canPromote" v-b-modal.promoteModal
                           class="btn btn-style-green btn-sm align-middle">Promote changes to production
                    </b-btn>
                </div>




                <h5>Reserved Vehicle Data Params</h5>
                <p>
                    The following keys are the default vehicle data params defined by the Mobile API and cannot
                    be used for custom vehicle data.
                </p>

                <ul>
                    <li v-for="(param, index) in reserved_params">{{ param }}</li>
                </ul>


<!--                <h5>Custom Vehicle Data Params</h5>-->
<!--                <p>-->
<!--                    Define custom vehicle params supported by the manufacturer's HMI.-->
<!--                </p>-->


                <div class="form-row">
                    <h4>Custom Vehicle Data Mapping</h4>
                </div>

                <div class="form-row">
                    <div>
                        Define custom vehicle params supported by the manufacturer's HMI.
                    </div>
                </div>




                <!-- module config data -->
                <div class="functional-content" v-if="vehicle_data">
<!--                    <div> reserved: {{ reserved_params }}</div>-->

<!--                    <div> {{  vehicle_data.schema_items }}</div>-->

                    <div class="form-row">
                        <h4 for="name">Schema Version</h4>
                        <input v-model="vehicle_data.schema_version" :disabled="fieldsDisabled" class="form-control">

<!--                        <input v-model="module_config.endpoints['0x04']" :disabled="fieldsDisabled" class="form-control">-->
                    </div>

                    <div class="form-row">
                        <h4 for="name">Mapping</h4>

<!--                        <div class="rpc-container white-box">-->
<!--                            <div class="form-group row">-->
<!--                                <label class="col-sm-2 col-form-label">Schema Version</label>-->
<!--                                <div class="col-sm-10">-->
<!--                                    <input v-model="vehicle_data.schema_version" :disabled="fieldsDisabled" class="form-control">-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->

                    </div>


                    <div class="form-row">
                        <div>
                            <div v-for="(item, index) in vehicle_data.schema_items">
                                <div>
                                    <!--                            :item="item"-->

<!--                                    <div> item: {{ item }}</div>-->
                                    <schema-item
                                            v-if="!item.deleted"

                                            :item="item"
                                            :fieldsDisabled="fieldsDisabled"
                                            :index="index"
                                            :items="vehicle_data.schema_items"
                                    ></schema-item>

                                    <!--                            <h3>Name: {{ item.name }}</h3>-->

                                </div>
                            </div>
                            <!-- save button -->
                            <div>
                                <!--                                                        v-if="!fieldsDisabled"
                                -->

                                <div id="add" class="another-rpc pointer"
                                     v-on:click="addSchemaItem()"
                                >
                                    Add Schema Item
                                    <i class="fa fa-plus middle-middle"></i></div>

<!--                                <button-->
<!--                                        v-on:click="addSchemaItem()"-->
<!--                                >-->
<!--                                    Add Schema Item-->
<!--                                </button>-->

                            </div>

                        </div>
                    </div>

                    <!-- save button -->
                    <div>
                        <vue-ladda
                                type="submit"
                                class="btn btn-card btn-style-green"
                                data-style="zoom-in"
                                v-if="!fieldsDisabled"
                                v-on:click="saveVehicleData()"
                                v-bind:loading="save_button_loading">
                            Save vehicle data config
                        </vue-ladda>
                    </div>
                </div>

                <!-- PROMOTE GROUP MODAL -->
                <b-modal ref="promoteModal" title="Promote Custom Vehicle Data to Production" hide-footer id="promoteModal"
                         tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
                    <small class="form-text text-muted">
                        This will promote the custom vehicle data mappings to production, immediately updating the production policy
                        table. Are you sure you want to do this?
                    </small>
                    <vue-ladda
                            type="button"
                            class="btn btn-card btn-style-green"
                            data-style="zoom-in"
                            v-on:click="promoteConfigClick()"
                            v-bind:loading="promote_button_loading">
                        Yes, promote to production!
                    </vue-ladda>
                </b-modal>
            </main>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                'environment': 'STAGING',
                'environmentOptions': [
                    {
                        'text': 'Staging',
                        'value': 'STAGING'
                    },
                    {
                        'text': 'Production',
                        'value': 'PRODUCTION'
                    }
                ],
                'integerInput': {
                    'regExp': /^[\D]*|\D*/g, // Match any character that doesn't belong to the positive integer
                    'replacement': ''
                },
                'save_button_loading': false,
                'promote_button_loading': false,
                'module_config': null,
                'vehicle_data': {
                    'schema_items': []
                },
                'reserved_params': []
            };
        },
        computed: {
            canPromote: function() {
                return this.vehicle_data && this.vehicle_data.status === 'STAGING';
            },
            fieldsDisabled: function() {
                return this.environment != 'STAGING';
            }
        },
        methods: {
            'parseVehicleData': function(vehicle_data) {
                // let schema_items = [];
                function updateItem(item)
                {
                    console.log(`updateItem`,item);
                    item.minvalue =  item.minvalue || '';
                    item.maxvalue =     item.maxvalue || '';
                    item.minsize = item.minsize || '';
                    item.maxsize = item.maxsize || '';
                    item.minlength = item.minlength  || '';
                    item.maxlength = item.maxlength || '';
                    if (item.params)
                    {
                        for (let param of item.params)
                        {
                            updateItem(param);
                        }
                    }
                }
                for (let schema_item of vehicle_data.schema_items)
                {

                    updateItem(schema_item);

                    // schema_item.minvalue =  schema_item.minvalue || '';
                    // schema_item.maxvalue =     schema_item.maxvalue || '';
                    // schema_item.minsize = schema_item.minsize || '';
                    // schema_item.maxsize = schema_item.maxsize || '';
                    // schema_item.minlength = schema_item.minlength  || '';
                    // schema_item.maxlength = schema_item.maxlength || '';


                    // item.params;

                    // let item = {
                    //             name: schema_item.name,
                    //             key: schema_item.key,
                    //             array: schema_item.array,
                    //             since: schema_item.since,
                    //             until: schema_item.until,
                    //             removed: schema_item.removed,
                    //             deprecated: schema_item.deprecated,
                    //             minvalue: schema_item.minvalue || '',
                    //             maxvalue: schema_item.maxvalue || '',
                    //             minsize: schema_item.minsize || '',
                    //             maxsize: schema_item.maxsize || '',
                    //             minlength: schema_item.minlength  || '',
                    //             maxlength: schema_item.maxlength || '',
                    //             params: schema_item.params,
                    //         };


                }
                this.vehicle_data = vehicle_data;

                // console.log(`parsedVehicleData`,vehicle_data);
                // let data = {
                //
                //     schema_items: vehicle_data.schema_items,
                // };


            },
            'addSchemaItem': function() {
                this.vehicle_data.schema_items.push(
                    {
                        name: '',
                        key: '',
                        type: '',
                        array: false,
                        since: '',
                        until: '',
                        removed: false,
                        deprecated: false,
                        minvalue: '',
                        maxvalue: '',
                        minsize: '',
                        maxsize: '',
                        minlength: '',
                        maxlength: '',
                        params: []

                    }
                );

            },
            'toTop': function() {
                this.$scrollTo('body', 500);
            },
            'getData': function() {
            },
            'environmentClick': function() {
                this.$nextTick(function() {
                    this.httpRequest('get', 'vehicledata', {
                        'params': {
                            'environment': this.environment
                        }
                    }, (err, res) => {
                        if (err) {
                            console.log('Error fetching vehicle data: ');
                            console.log(err);
                        } else {
                            res.json().then(parsed => {
                                console.log(`vehicle data`,parsed,parsed.data);
                                if (parsed.data.vehicle_data) {
                                    this.parseVehicleData(parsed.data.vehicle_data);
                                } else {
                                    console.log('No vehicle data returned');
                                }
                            });
                        }
                    });

                    this.httpRequest('get', 'vehicledata/reserved-params',{}, (err, res) => {
                        if (err) {
                            console.log('Error fetching reserved_params');
                            console.log(err);
                        } else {
                            res.json().then(parsed => {
                                console.log(`vehicle data reserved_params`,parsed,parsed.data);
                                if (parsed.data.reserved_params) {
                                    this.reserved_params = parsed.data.reserved_params;
                                } else {
                                    console.log('No vehicle data returned');
                                }
                            });
                        }
                    });

                    this.httpRequest('get', 'vehicledata/param-types', {
                        'params': {
                            'environment': this.environment
                        }
                    }, (err, res) => {
                        if (err) {
                            console.log('Error fetching param-types');
                            console.log(err);
                        } else {
                            res.json().then(parsed => {
                                console.log(`vehicle data`,parsed,parsed.data);
                                if (parsed.data.vehicle_data_types) {
                                    this.vehicle_data_types = parsed.data.vehicle_data_types;
                                } else {
                                    // console.log('No module config data returned');
                                }
                            });
                        }
                    });
                });
            },
            'saveVehicleData': function() {
                this.handleModalClick('save_button_loading', null, 'saveData');
            },
            'saveData': function(cb) {
                this.httpRequest('post', 'vehicledata', { 'body': this.vehicle_data }, (err) => {
                    this.toTop();
                    cb();
                });
            },
            'promoteConfigClick': function() {
                this.handleModalClick('promote_button_loading', 'promoteModal', 'promoteConfig');
            },
            'promoteConfig': function(cb) {
                this.httpRequest('post', 'vehicle-data/promote', { 'body': this.module_config }, cb);
            },
            'addRetryUpdateElement': function() {
                var newVal = this.module_config.seconds_between_retries.length ? this.module_config.seconds_between_retries[this.module_config.seconds_between_retries.length - 1] * 5 : 1;
                this.module_config.seconds_between_retries.push(newVal);
            },
            'removeRetryUpdateElement': function(key) {
                this.module_config.seconds_between_retries.splice(key, 1);
            }
        },
        mounted: function() {
            this.environmentClick();
        },
        beforeDestroy() {
            // ensure closing of all modals
            this.$refs.promoteModal.onAfterLeave();
        }
    };
</script>
