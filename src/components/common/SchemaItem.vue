<template>
    <!--            TODO class based margin-->
    <div class="white-box rpc-container" style="margin-left:10px;">
        <div>fieldsDisabled: {{ fieldsDisabled }}</div>
        <div> {{ item }}</div>
        <h5>Name: {{ item.name }}</h5>
        <h5>{{ item.language_id }}
            <i
                v-on:click="removeItem()"
                v-if="!fieldsDisabled"
                class="pointer pull-right fa fa-times hover-color-red"
                aria-hidden="true">
            </i>
        </h5>

        <div class="form-group row">
            <label class="col-sm-2 col-form-label">TTS</label>
            <div class="col-sm-10">
                <input v-model="item.tts" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Line 1</label>
            <div class="col-sm-10">
                <input v-model="item.line1" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Line 2</label>
            <div class="col-sm-10">
                <input v-model="item.line2" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Text Body</label>
            <div class="col-sm-10">
                <input v-model="item.text_body" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Label</label>
            <div class="col-sm-10">
                <input v-model="item.label" :disabled="fieldsDisabled" class="form-control">
            </div>
        </div>

        <div v-for="(param, paramIndex) in item.params">
            <!--            TODO class based margin-->
            <div
            >
                <!--                            :item="item"-->

                <schema-item
                        v-if="param.selected"

                        v-bind:item="param"
                        :fieldsDisabled="fieldsDisabled"
                        :index="paramIndex"
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
                    selected: true,
                    params: [],
                                 })
            },
            "removeItem": function() {
                console.log(`removeItem`,this.item);
                this.item.selected = false;
                this.item.tts = `deleted`;
                // console.log(`removeItem`,this.items,this.index,this.item);
                // delete this.items[this.index];
                // this.item.selected = false;
            }
        }
    }
</script>
