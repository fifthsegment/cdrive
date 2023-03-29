#!/bin/sh

if grep -q "\"username\": \"admin\"" /opt/jboss/keycloak/standalone/configuration/keycloak-add-user.json; then
  echo "Admin user already added to Keycloak"
  exit 1
else
  echo "Admin user not found in Keycloak"
  exit 0
fi
