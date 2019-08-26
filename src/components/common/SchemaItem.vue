<template>
    <!--            TODO class based margin-->
    <div class="white-box rpc-container" style="margin-left:10px;">
        <h5>{{ item.language_id }}
            <i
                v-on:click="removeItem()"
                v-if="!fieldsDisabled"
                class="pointer pull-right fa fa-times hover-color-red"
                aria-hidden="true">
            </i>
        </h5>

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

        <div v-for="(param, paramIndex) in item.params">
            <!--            TODO class based margin-->
            <div
            >
                <!--                            :item="item"-->

                <div> {{ param }} </div>
                <schema-item
                        v-bind:item="param"
                        :fieldsDisabled="fieldsDisabled"
                        :index="paramIndex"
                        :items="item.params"
                ></schema-item>

                <!--                            <h3>Name: {{ item.name }}</h3>-->
            </div>
        </div>
        <button
                v-on:click="addParam()"
        >
            Add Param
        </button>


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
