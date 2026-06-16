#!/usr/bin/env bash
# SPDX-FileCopyrightText: Fondation RERO+
# SPDX-License-Identifier: AGPL-3.0-or-later
RED='\033[0;31m'
GREEN='\033[0;0;32m'
NC='\033[0m' # No Color

display_error_message () {
	echo -e "${RED}$1${NC}" 1>&2
}

display_success_message () {
    echo -e "${GREEN}$1${NC}" 1>&2
}

set -e

display_success_message "Building library..."
ng build --configuration production @rero/ng-core

display_success_message "Generate style file..."
npm run build-css

display_success_message "Building test application..."
ng build ng-core-tester --configuration production

display_success_message "Linting the projects..."
ng lint

display_success_message "Run the tests"
ng test @rero/ng-core --watch=false --headless
ng test ng-core-tester --watch=false --headless

display_success_message "Run pack"
npm run pack
