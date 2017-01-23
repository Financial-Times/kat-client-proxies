#! /bin/bash

#command -v jq >/dev/null 2>&1 || { echo >&2 "jq is required, please install it and try again :)"; exit 1; }

# neo4j-shell -c 'match(n) detach delete(n);'
# neo4j-shell -file time-tree.cql
# neo4j-shell -file time-tree-index.cql

neo4j-shell -file myFTFixtures.cql
