<template>
    <!--            TODO class based margin-->
<!--    white-box -->
    <div class="rpc-container white-box" style="border-bottom:none;">
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


        <div id="add" class="another-rpc pointer"
             v-if="item.name"
             v-on:click="addParam()"
        >
            Add Param To {{ item.name }}
            <i class="fa fa-plus middle-middle"></i></div>

<!--        <button v-if="item.name"-->
<!--                v-on:click="addParam()"-->
<!--        >-->
<!--            Add Param To {{ item.name }}-->
<!--        </button>-->

<!--        <vue-ladda-->
<!--                type="submit"-->
<!--                class="btn btn-card btn-style-green"-->
<!--                data-style="zoom-in"-->
<!--                v-if="item.name"-->
<!--                v-on:click="saveVehicleData()"-->
<!--        >-->
<!--            Add Param To {{ item.name }}-->
<!--        </vue-ladda>-->


    </div>
</template>

<script>
    export default {
        props: ['item','index','items','environment','fieldsDisabled'],
        data () {
            return {
            };
        },
        methods: {
            "addParam": function () {

                this.item.params.push({

                    // selected: true,
                    // params: [],
                                 })
            },
            "removeItem": function() {
                this.$delete(this.items, this.index);
            }
        }
    }
</script>
