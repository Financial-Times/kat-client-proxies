node_modules/@financial-times/n-gage/index.mk:
	npm install --no-save --no-package-lock @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

unit-test:
	export KAT_FT_TOOL_ADMIN_ID=00000000-0000-0000-0000-012345678910; mocha 'test/**/*.js' --inline-diffs  --timeout 10000

test:
	make verify
	make unit-test
	# make a11y
