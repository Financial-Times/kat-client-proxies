MERGE (p:Preference {uuid:'email-digest'})
SET p.name='Digest email'

MERGE (l:License {uuid: '738dd3e8-42be-4b05-b53f-cad262434d72', tag:'KATProxyFixture'})
MERGE (g:Group {uuid: l.uuid})
SET g.tag = l.tag
MERGE (g)<-[:member]-(l)

MERGE (u:User {uuid: '48c88fa7-2034-4f88-987b-40718d6a5520'})
SET u.tag = l.tag
MERGE (u)<-[:member]-(l)
MERGE (u)<-[:member]-(g)


MERGE (u)-[ep:preferred]->(p)
SET ep = {timezone:'Europe/London', type:'daily', byTool:'KMT', byUser:'8619e7a0-65b7-446b-9931-4197b3fe0cbf'}


MERGE (u)-[:followed]->(c1:Concept {uuid: 'TnN0ZWluX09OX0FGVE1fT05fMTMxMTYz'})
MERGE (u)-[:followed]->(c2:Concept {uuid: 'MQ==-U2VjdGlvbnM=', name:l.tag})
MERGE (g)-[:followed]->(c1)
MERGE (g)-[:followed]->(c2)
SET c1.name=l.tag
SET c2.name=l.tag
SET c1.taxonomy=l.tag
SET c2.taxonomy=l.tag
;
