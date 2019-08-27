<template>
    <!--            TODO class based margin-->
<!--    white-box -->


    <div class="rpc-container white-box" style="border-bottom:none;" v-if="item && false">
        <div class="form-group row">
            <h5>
                <i aria-hidden="true" class="pointer pull-right fa fa-times hover-color-red"
                   v-on:click="removeItem()"
                ></i>
            </h5>
        </div>


        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Name</label>
            <div class="col-sm-10">
                <input v-model="item.name" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Type</label>
            <div class="col-sm-10">
                <input v-model="item.type" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Key</label>
            <div class="col-sm-10">
                <input v-model="item.key" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div class="form-group row">
            <div class="col-sm-2">
                <pattern-input class="form-control text-truncate"
                               :regExp="integerInput.regExp"
                               :replacement="integerInput.replacement"
                               :disabled="fieldsDisabled"
                               v-model.number="item."></pattern-input>
            </div>
            <label class="col-sm-10 col-form-label color-primary" style="text-transform:none">Ignition {{ Math.abs(module_config.exchange_after_x_ignition_cycles) == 1 ? "Cycle" : "Cycles" }}</label>
        </div>


        <div v-for="(param, paramIndex) in item.params"
            style="border-left:1px solid black; margin:10px; padding:10px;"
        >

            <schema-item
                    v-bind:item="param"
                    :fieldsDisabled="fieldsDisabled"
                    :index="paramIndex"
                    :items="item.params"
            ></schema-item>
        </div>

<!--        <div>item: {{ item }}{{ item.name }} {{ item.type }} {{ item.name && item.type === 'Struct' }} {{ item.params }}</div>-->

        <div id="add" class="another-rpc pointer"
             v-if="item.name && item.type === 'Struct'"
             v-on:click="addParam()"
        >
            Add Param To Struct {{ item.name }}
            <i class="fa fa-plus middle-middle"></i>
        </div>

<!--        <b-modal ref="addRpcModal" title="Select RPC" hide-footer id="addRpcModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">-->
<!--            <input v-model="rpc_search" placeholder="Search for an RPC" class="form-control" id="rpc-search">-->

<!--            <ul class="list-group rpc-list">-->
<!--                <li-->
<!--                        class="list-group-item rpc-list-item pointer"-->
<!--                        v-for="(item, index) in fg.rpcs"-->
<!--                        v-if="isRpcAvailable(item)"-->
<!--                        v-on:click="addRpc(item)"-->
<!--                >-->
<!--                    {{ item.name }}-->
<!--                </li>-->
<!--            </ul>-->
<!--        </b-modal>-->


    </div>
</template>

<script>
    export default {
        props: ['item','index','items','environment','fieldsDisabled'],
        data () {
            return {
                "integerInput": {
                    "regExp": /^[\D]*|\D*/g, // Match any character that doesn't belong to the positive integer
                    "replacement": ""
                }
            };
        },
        methods: {
            "addParam": function () {

                console.log(`addParam`,this.item);

                //Populating the object is required.
                this.item.params.push({
                    params: [],
                    name: '',
                    type: ''
                    // selected: true,
                    // params: [],
                                 })
            },
            "removeItem": function() {
                this.$delete(this.items, this.index);
            }
        },
        mounted: function(){
            console.log(`mounted`,this.item,this.index);
        },
    }
</script>
