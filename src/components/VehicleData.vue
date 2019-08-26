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

                <h4>Module Config<a class="fa fa-question-circle color-primary doc-link" v-b-tooltip.hover
                                    title="Click here for more info about this page"
                                    href="https://smartdevicelink.com/en/guides/sdl-server/user-interface/module-config/"
                                    target="_blank"></a></h4>




                <!-- module config data -->
                <div class="functional-content" v-if="vehicle_data">
                    <div> {{  vehicle_data.schema_items }}</div>

                    <div class="form-row">
                        <div>
                            <div v-for="(item, index) in vehicle_data.schema_items">
                                <div>
                                    <!--                            :item="item"-->

                                    <div> item: {{ item }}</div>
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


                                <button
                                        v-on:click="addSchemaItem()"
                                >
                                    Add Schema Item
                                </button>

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
                <b-modal ref="promoteModal" title="Promote Module Config to Production" hide-footer id="promoteModal"
                         tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
                    <small class="form-text text-muted">
                        This will promote the module config to production, immediately updating the production policy
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
                }
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
            'addSchemaItem': function() {
                this.vehicle_data.schema_items.push({
                                                        selected: true,
                                                        params: []
                                                    });

            },
            'toTop': function() {
                this.$scrollTo('body', 500);
            },
            'environmentClick': function() {
                this.$nextTick(function() {
                    this.httpRequest('get', 'vehicledata', {
                        'params': {
                            'environment': this.environment
                        }
                    }, (err, res) => {
                        if (err) {
                            console.log('Error fetching module config data: ');
                            console.log(err);
                        } else {
                            res.json().then(parsed => {
                                console.log(`vehicle data`,parsed,parsed.data)
                                if (parsed.data.vehicle_data) {
                                    this.vehicle_data = parsed.data.vehicle_data;
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
                this.httpRequest('post', 'module/promote', { 'body': this.module_config }, cb);
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
