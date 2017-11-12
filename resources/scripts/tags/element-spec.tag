<element-spec ident="{ ident }" mode="{ mode }">
    <h3>
        <a href="#elem-{ ident }" data-toggle="collapse"><span ref="toggle" class="material-icons">expand_more</span></a>
        <input type="text" class="inline-edit" value="{ ident }"/>
        <div class="btn-group">
            <button type="button" class="btn dropdown-toggle" data-toggle="dropdown"><i class="material-icons">add</i></button>
            <ul class="dropdown-menu">
                <li><a href="#" onclick="{ addModel }">model</a></li>
                <li><a href="#" onclick="{ addModel }">modelSequence</a></li>
                <li><a href="#" onclick="{ addModel }">modelGrp</a></li>
            </ul>
        </div>
        <button type="button" class="btn" onclick="{ remove }"><i class="material-icons">remove</i></button>
    </h3>

    <div ref="models" id="elem-{ ident }" class="collapse models">
        <model each="{ models }" behaviour="{ this.behaviour }" predicate="{ this.predicate }"
            type="{ this.type }" output="{ this.output }" models="{ this.models }"
            parameters="{ this.parameters }"/>
    </div>

    <script>
        this.mixin('utils');

        this.on("mount", function() {
            var self = this;
            $(this.refs.models).on("show.bs.collapse", function() {
                $(self.refs.toggle).text("expand_less");
            });
            $(this.refs.models).on("hide.bs.collapse", function() {
                $(self.refs.toggle).text("expand_more");
            });
        });

        addModel(ev) {
            var type = $(ev.target).text();

            this.models = this.updateTag('model');

            $(this.refs.models).collapse("show");
            this.models.unshift({
                behaviour: 'inline',
                predicate: null,
                type: type,
                output: null,
                models: [],
                parameters: [],
                renditions: []
            });
        }

        removeModel(item) {
            var index = this.models.indexOf(item)
            this.models.splice(index, 1)

            this.update();
        }

        remove(ev) {
            this.parent.removeElementSpec(ev.item);
        }

        serialize() {
            var xml = '<elementSpec ident="' + this.ident + '"';
            if (this.mode) {
                xml += ' mode="' + this.mode + '"';
            }
            xml += '>\n';

            xml += this.serializeTag('model');

            xml += '</elementSpec>\n';
            return xml;
        }
    </script>

    <style>
        input { vertical-align: middle; }
    </style>
</element-spec>