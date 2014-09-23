test: .FORCE
	istanbul cover node_modules/.bin/_mocha
	istanbul report clover
	istanbul report cobertura

.FORCE:

test_requirements:
	@echo "Installing test requirements"
	npm install

clean: 
	rm -rf coverage/*

func_test: test_requirements, test