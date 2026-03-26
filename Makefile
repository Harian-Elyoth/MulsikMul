.PHONY: help dev android ios web test lint clean install build-apk build-aab build-ios submit-android submit-ios eas-login eas-init

# ─── Default ────────────────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Development ────────────────────────────────────────────────────────────────
install: ## Install dependencies
	npm install

dev: ## Start Expo dev server
	npx expo start

android: ## Start on Android device/emulator
	npx expo start --android

ios: ## Start on iOS simulator
	npx expo start --ios

web: ## Start on web browser
	npx expo start --web

# ─── Testing ────────────────────────────────────────────────────────────────────
test: ## Run test suite
	npm test

test-watch: ## Run tests in watch mode
	npx jest --watch

test-coverage: ## Run tests with coverage report
	npx jest --coverage

# ─── EAS Setup ──────────────────────────────────────────────────────────────────
eas-login: ## Log in to Expo account
	npx eas-cli login

eas-init: ## Initialize EAS for this project
	npx eas-cli build:configure

# ─── Build ──────────────────────────────────────────────────────────────────────
build-apk: ## Build Android APK (installable file)
	npx eas-cli build -p android --profile preview

build-aab: ## Build Android AAB (Play Store upload)
	npx eas-cli build -p android --profile production

build-ios: ## Build iOS archive
	npx eas-cli build -p ios --profile production

build-apk-local: ## Build APK locally (requires Android SDK)
	npx eas-cli build -p android --profile preview --local

build-aab-local: ## Build AAB locally (requires Android SDK)
	npx eas-cli build -p android --profile production --local

# ─── Submit to Stores ───────────────────────────────────────────────────────────
submit-android: ## Submit to Google Play Store
	npx eas-cli submit -p android --latest

submit-ios: ## Submit to Apple App Store
	npx eas-cli submit -p ios --latest

# ─── Utilities ──────────────────────────────────────────────────────────────────
clean: ## Clear Expo cache and build artifacts
	npx expo start --clear
	rm -rf .expo

prebuild-android: ## Generate native Android project
	npx expo prebuild --platform android

prebuild-ios: ## Generate native iOS project
	npx expo prebuild --platform ios

upgrade: ## Upgrade Expo SDK and dependencies
	npx expo install --fix
