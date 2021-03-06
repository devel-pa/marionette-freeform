/* global describe, it, expect, beforeEach, testregion */
/* jshint expr: true */
define(function(require) {
	'use strict';

	var Element = require('src/model/element');
	var ElementView = require('src/view/element_view');
	var elements = require('spec/helpers/element_types');
	var clone = require('spec/helpers/clone');

	describe('ElementView', function() {
		this.timeout(0);

		describe('with a non-Element model', function() {
			beforeEach(function() {
				this.error = null;
				this.model = new Backbone.Model({ type: 'text' });
				this.options = { model: this.model };
				try {
					this.element_view = new ElementView(this.options);
				} catch(e) {
					this.error = e;
				}
			});

			it('should not exist', function() {
				expect(this.element_view).to.not.exist;
			});
			it('should throw an error', function() {
				expect(this.error).to.exist;
				expect(this.error.message).to.equal('ElementView requires an Element model.');
			});

		});

		describe('with an Element model', function() {
			beforeEach(function() {
				this.error = null;
				this.model = new Element({ type: 'text' });
				this.options = { model: this.model };
				try {
					this.element_view = new ElementView(this.options);
					this.element_view.render();
				} catch(e) {
					this.error = e;
				}
			});

			it('should set a custom className on itself', function() {
				var element = new Element({ type: 'text' });
				var options = { model: element, className: 'foo' };
				var element_view = new ElementView(options);
				element_view.render();
				expect(element_view.$el).to.exist;
				expect(element_view.$el.hasClass('element')).to.be.false;
				expect(element_view.$el.hasClass('foo')).to.be.true;
			});

			_.each(elements.types, function(type) {
				describe('with type ' + type, function() {
					var selector = elements.selectors[type];

					beforeEach(function() {
						this.error = null;
						this.element = new Element(clone(elements.index[type]));
						this.options = { model: this.element };
						try {
							this.element_view = new ElementView(this.options);
							testregion.show(this.element_view);
						} catch(e) {
							this.error = e;
						}
					});

					it('should exist', function() {
						expect(this.element_view).to.exist;
					});
					it('should not throw an error', function() {
						expect(this.error).to.be.null;
					});
					it('should set the default element className on itself', function() {
						expect(this.element_view.$el).to.exist;
						expect(this.element_view.$el.hasClass('element')).to.be.true;
					});

					it('should set a custom className on itself', function() {
						var options = _.extend({ className: 'foo' }, this.options);
						var element_view = new ElementView(options);
						element_view.render();
						expect(element_view.$el).to.exist;
						expect(element_view.$el.hasClass('element')).to.be.false;
						expect(element_view.$el.hasClass('foo')).to.be.true;
					});

					it('should have classname "type-'+type+'"', function() {
						expect(this.element_view.$el).to.exist;
						expect(this.element_view.$el.hasClass('type-'+type)).to.be.true;
					});

					if (_.contains(['submit','reset'], type)) {
						it('should have classname "type-button"',function() {
							expect(this.element_view.$el.hasClass('type-button')).to.be.true;
						});
					}

					it('should have a selector in test data', function() {
						expect(selector).to.exist;
					});

					it('should contain a node matching "'+selector+'"', function() {
						var count = 1;
						if (type === 'radioset') count = 4; // test data for radioset has 4 inputs
						if (type === 'buttonset') count = 3; // test data for buttonset has 3 buttons
						expect(this.element_view.$).to.exist;
						var $input = this.element_view.$(selector);
						expect($input).to.exist;
						expect($input.length).to.equal(count);
					});

					if (! _.contains(['submit','reset','button','buttonset'], type)) {
						describe('with a label', function() {
							beforeEach(function() {
								this.element = new Element(clone(elements.index[type]));
								this.label = _.uniqueId('label');
								this.element.set('label', this.label);
								this.selector = '> .label-region label.label';
								this.options = { model: this.element };
								this.view = new ElementView(this.options);
							});

							it('should show the label', function() {
								testregion.show(this.view);
								expect(this.view.$(this.selector).length).to.equal(1);
								expect(this.view.$(this.selector).text()).to.equal(this.label);
							});
							it('should update the label when it changes', function() {
								testregion.show(this.view);
								var new_label = _.uniqueId('label');
								this.element.set('label', new_label);
								expect(this.view.$(this.selector).length).to.equal(1);
								expect(this.view.$(this.selector).text()).to.equal(new_label);
							});
							it('should hide the label when it is set to an empty string', function() {
								testregion.show(this.view);
								this.element.set('label', '');
								expect(this.view.$(this.selector).length).to.equal(0);
							});
							it('should hide the label when it is unset', function() {
								testregion.show(this.view);
								this.element.unset('label');
								expect(this.view.$(this.selector).length).to.equal(0);
							});
						});

						describe('when the element has an error', function() {
							beforeEach(function() {
								this.element = new Element(clone(elements.index[type]));
								this.element.set({
									validator: function(value) {
										if (value === 'foo') return 'Invalid foo message.';
									}
								});
								this.options = { model: this.element };
							});
							it('should set the default error class on itself', function() {
								var default_error_class = 'element-error';
								var element_view = new ElementView(this.options);
								testregion.show(element_view);
								expect(element_view.$el.hasClass(default_error_class)).to.be.false;
								this.element.set('value', 'foo');
								expect(element_view.$el.hasClass(default_error_class)).to.be.true;
							});
							it('should set a custom error class on itself', function() {
								var default_error_class = 'element-error';
								var custom_error_class = 'myelement-myerror';
								this.options.className = 'myelement';
								this.element.set('error_class', 'myerror');
								var element_view = new ElementView(this.options);
								element_view.render();
								expect(element_view.$el.hasClass(default_error_class)).to.be.false;
								expect(element_view.$el.hasClass(custom_error_class)).to.be.false;
								this.element.set('value', 'foo');
								expect(element_view.$el.hasClass(default_error_class)).to.be.false;
								expect(element_view.$el.hasClass(custom_error_class)).to.be.true;
							});
							it('should show the error message in a label with the default error class', function() {
								var default_error_selector = '> .error-region label.error'; // need specificity since some elements can contain nested element_views (e.g. radioset)
								var element_view = new ElementView(this.options);
								element_view.render();
								expect(element_view.$(default_error_selector).length).to.equal(0);
								this.element.set('value', 'foo');
								expect(element_view.$(default_error_selector).length).to.equal(1);
								expect(element_view.$(default_error_selector).text()).to.equal('Invalid foo message.');
							});
							it('should show the error message in a label with a custom error class', function() {
								var default_error_selector = 'label.error';
								var custom_error_selector = 'label.myerror';
								this.element.set('error_class', 'myerror');
								var element_view = new ElementView(this.options);
								element_view.render();
								expect(element_view.$(default_error_selector).length).to.equal(0);
								expect(element_view.$(custom_error_selector).length).to.equal(0);
								this.element.set('value', 'foo');
								expect(element_view.$(default_error_selector).length).to.equal(0);
								expect(element_view.$(custom_error_selector).length).to.equal(1);
								expect(element_view.$(custom_error_selector).text()).to.equal('Invalid foo message.');
							});
							describe('when the element is valid again', function() {
								beforeEach(function() {
									this.element_view = new ElementView(this.options);
									this.element_view.render();
									this.element.set('value', 'foo');
								});
								it('should remove the default error class from itself', function() {
									var default_error_class = 'element-error';
									expect(this.element_view.$el.hasClass(default_error_class)).to.be.true;
									this.element.set('value', 'bar');
									expect(this.element_view.$el.hasClass(default_error_class)).to.be.false;
								});
								it('should remove the default error label from the DOM', function() {
									var default_error_selector = '> .error-region label.error'; // need specificity since some elements can contain nested element_views (e.g. radioset)
									expect(this.element_view.$(default_error_selector).length).to.equal(1);
									this.element.set('value', 'bar');
									expect(this.element_view.$(default_error_selector).length).to.equal(0);
								});

								it('should remove a custom error class from itself', function() {
									var default_error_class = 'element-error';
									var custom_error_class = 'myelement-myerror';
									var element = new Element({
										type: 'text',
										error_class: 'myerror',
										validator: function(value) {
											if (value === 'foo') return 'Invalid foo message.';
										}
									});
									var options = {
										model: element,
										className: 'myelement'
									};
									var element_view = new ElementView(options);
									element_view.render();
									element.set('value', 'foo');
									expect(element_view.$el.hasClass(default_error_class)).to.be.false;
									expect(element_view.$el.hasClass(custom_error_class)).to.be.true;
									element.set('value', 'bar');
									expect(element_view.$el.hasClass(default_error_class)).to.be.false;
									expect(element_view.$el.hasClass(custom_error_class)).to.be.false;
								});
								it('should remove a custom error label from the DOM', function() {
									var default_error_selector = '> .error-region label.error'; // need specificity since some elements can contain nested element_views (e.g. radioset)
									var custom_error_selector = '> .error-region label.myerror';
									var element = new Element({
										type: 'text',
										error_class: 'myerror',
										validator: function(value) {
											if (value === 'foo') return 'Invalid foo message.';
										}
									});
									var options = {
										model: element,
										className: 'myelement'
									};
									var element_view = new ElementView(options);
									element_view.render();
									element.set('value', 'foo');
									expect(element_view.$(default_error_selector).length).to.equal(0);
									expect(element_view.$(custom_error_selector).length).to.equal(1);
									element.set('value', 'bar');
									expect(element_view.$(default_error_selector).length).to.equal(0);
									expect(element_view.$(custom_error_selector).length).to.equal(0);
								});

							});

						});

					}

				});

			});

		});

	});

});
