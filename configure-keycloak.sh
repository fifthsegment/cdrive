#!/bin/bash
set -e

echo "Configuring Keycloak..."

# Wait for Keycloak to start
until curl -f http://localhost:8080/auth/; do
    sleep 5
done

# Import realm and client configuration
kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user admin --password admin
kcadm.sh create realms -f /opt/jboss/startup-scripts/my-realm.json

echo "Keycloak configuration complete."