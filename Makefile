CSS_FILES = css/bootstrap-dropdown.css css/bootstrap-modal.css css/bootstrap-popover.css css/component-autoSuggest.css css/generic.css css/bootstrap-alert.css css/bootstrap-form.css css/bootstrap-navbar.css css/bootstrap-table.css css/component-userbox.css css/layout.css css/bootstrap-button.css css/bootstrap-generic.css css/bootstrap-pagination.css css/bootstrap-tooltip.css css/font-awesome.css css/bootstrap-2.0.4.css

build:
	@mkdir -p target/css
	@echo "Compressing SURFnet styleguide"
	@recess --compress ${CSS_FILES} > target/css/style.min.css
	@echo "Copying other assets.."
	@cp -r images target
	@cp -r font target
	@echo "Your style is ready in the 'target' directory"

clean:
	@rm -rf target
