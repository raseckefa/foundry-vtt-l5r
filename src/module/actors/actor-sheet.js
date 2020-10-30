
export class L5RActorSheet extends ActorSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["l5r", "sheet", "actor"],
            template: "systems/l5r/templates/actor/actor-sheet.html",
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }
    
    getData() {
        const sheetData = super.getData();

        this._prepareItems(sheetData);

        const feats = sheetData.items.filter((item) => item.type === "feat");

        sheetData.data.feats = feats;
        
        return sheetData;
    }

    /**
    * Update the actor.
    * @param event 
    * @param formData 
    */
    _updateObject(event, formData) {
        return this.object.update(formData);
    }
    
    /**
    * Prepare item data to be displayed in the actor sheet.
    * @param sheetData Data of the actor been displayed in the sheet.
    */
    _prepareItems(sheetData) {       
        for (let item of sheetData.items) {
            if (item.type === "weapon") {
                item.isWeapon = true;
                item.isEquipment = true;
            } else if (item.type === "feat"){
                item.isFeat = true;
            }
            else {
                item.isEquipment = true;
            }
        }
    }

    _prepareFeats() {
    }
    
    /**
    * Subscribe to events from the sheet.
    * @param html HTML content of the sheet.
    */
    activateListeners(html) {
        super.activateListeners(html);
        
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;
        
        // Update Inventory Item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data("itemId");      
            const item = this.actor.getOwnedItem(itemId);
            item.sheet.render(true);
        });
        
        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data("itemId");      
            this.actor.deleteOwnedItem(itemId);
        });
        
        html.find('.feat-add').click(ev => {
            this._createFeat();
        });
        
        html.find('.feat-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".feat");
            const featId = li.data("featId");
            console.log("Remove feat" + featId + " clicked");
            
            this.actor.deleteOwnedItem(featId);
        });
        
        html.find('.feat-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".feat");
            const featId = li.data("featId");      
            const feat = this.actor.getOwnedItem(featId);
            feat.sheet.render(true);
        });
        
        html.find('.skill-name').click(ev => {
            const li = $(ev.currentTarget).parents(".skill");
            const skillId = li.data("skill");
            
            this._onSkillClicked(skillId);
        });

        html.find('.adquisition-add').click(ev => {
            this._createFeat();
        });
    }
    
    /**
    * Creates a new feat for the character and shows a window to edit it.
    */
    async _createFeat() {
        const data = {
            name: game.i18n.localize('L5R.FeatPlaceholderName'),
            type: "feat"
        };
        const created = await this.actor.createEmbeddedEntity("OwnedItem", data);
        const feat = this.actor.getOwnedItem(created._id);
        
        // Default values
        //feat.rank = 1;
        //feat.xp_used = 0;

        feat.sheet.render(true);
        
        return feat;
    }
    
    /**
    * React to a skill from the skills list been clicked.
    * @param {string} skillId Unique ID of the skill been clicked.
    */
    async _onSkillClicked(skillId) {
        console.log("Clicked on skill " + skillId);
        const iterator1 = game.actors.values()
        const iterator1aux = iterator1.next().value
        const actorKEY = iterator1aux.data._id
        const actor = game.actors.get(actorKEY) 

        const skills = actor.data.data.skills
        var skill = ''
        if (eval("skills.martial."+skillId)) {
            skill = eval("skills.martial."+skillId+".value")
        }

        const rings = actor.data.data.rings
        const stances = actor.data.data.stances 

        var ring = '';
        if (stances.air.isSelected.value) {
        ring = rings.air
        } else if (stances.earth.isSelected.value) {
        ring = rings.earth
        } else if (stances.fire.isSelected.value) {
        ring = rings.fire
        } else if (stances.void.isSelected.value) {
        ring = rings.void
        } else if (stances.water.isSelected.value) {
        ring = rings.water
        }

        const r = ring+"b" + skill+"w"

        const d = game.specialDiceRoller.l5r.rollFormula(r) 

        const roll = new Roll('1d1');  
        roll.toMessage({ flavor: d, });
        
        // TODO
    }
}