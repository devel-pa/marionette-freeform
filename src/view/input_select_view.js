define(function(require) {
	'use strict';

	var Marionette = require('marionette');
	var Element = require('src/model/element');
	var InputAttributes = require('./input_attributes');


	var InputSelectOptionView = Marionette.ItemView.extend({
		tagName: 'option',
		template: _.template('<%- label %>'),
		attribute_keys: ['value', 'disabled']
	});

	// apply methods from InputAttributes mixin
	_.extend(InputSelectOptionView.prototype, InputAttributes, {
		attributes: function() {
			// use super method to apply attribute_keys
			var attributes = InputAttributes.attributes.call(this);

			// add selected attribute if model value matches options.selected
			attributes['selected'] = (this.model.get('value') === this.options.selected);

			return attributes;
		}
	});


	var InputSelectView = Marionette.CollectionView.extend({

		tagName: 'select',

		childView: InputSelectOptionView,
		childViewOptions: function() {
			return {
				selected: this.model.get('value')
			};
		},

		constructor: function(options) {
			Marionette.CollectionView.call(this, options);

			// validate model
			if (! (this.model instanceof Element)) throw new Error('InputView requires an Element model.');

			this.collection = this.model.get('values');

			// add placeholder option
			if (this.model.get('placeholder')) {
				this.collection.unshift({
					value: '',
					label: this.model.get('placeholder'),
					disabled: true
				});
			}

			// listen for external changes to the model
			this.listenTo(this.model, 'change:value', this.onModelChangeValue);

			// these steps allow the view to consume an existing dom element
			this.listenTo(this, 'render', this.setAttributes);
			var className = this.model.get('className');
			if (className) this.$el.addClass(className);
		},

		attribute_keys: ['id', 'name', 'disabled'],

		triggers: {
			'change': 'input:change',
		},

		onInputChange: function() {
			var value = this.getInputValue();
			this.model.set('value', value, { from: this });
		},

		getInputValue: function() {
			return this.$el.val();
		},
		setInputValue: function(value) {
			return this.$el.val(value);
		},

		onModelChangeValue: function(model, value, options) {
			if (options.from !== this) {
				this.$el.val(value);
			}
		}
	});

	// apply methods from InputAttributes mixin
	_.extend(InputSelectView.prototype, InputAttributes);

	return InputSelectView;

});
