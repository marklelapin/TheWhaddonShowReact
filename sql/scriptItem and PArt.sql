with ctehistory as
(
select JSON_VALUE (JsonUpdate, '$.Id') as id
, JSON_VALUE (JsonUpdate, '$.Created') as created
, JSON_VALUE (JsonUpdate, '$.Updated') as updated
, JSON_VALUE (JsonUpdate, '$.Type') as type
, JSON_VALUE (JsonUpdate, '$.Name') as status
, JSON_VALUE (JsonUpdate, '$.Text') as message
,jsonUpdate
from dbo.UpdateLog u
where id = 'bea51e68-4d29-4452-83b9-67f0bd16d8e4'
), ctelatestcreated as
(
select id, max(created) as created 
from dbo.UpdateLog group by id
), cteLatest as
(select h.* from ctehistory h
inner join ctelatestcreated l
on h.id = l.id 
and 
h.created = l.created
)
select * from cteLatest;



with ctehistory as
(
select 
JSON_VALUE (JsonUpdate, '$.Id') as id
, JSON_VALUE (JsonUpdate, '$.Created') as created
, JSON_VALUE (JsonUpdate, '$.IsActive') as isActive
, JSON_VALUE (JsonUpdate, '$.Name') as name
--,JsonUpdate

from dbo.UpdateLog u  where 
id in ('1c40501a-35cb-4c4e-8f9c-2c6e1e888dee')
and
UpdateType = 'PartUpdate'

--Order by id,created
), ctelatestcreated as
(
select id, max(created) as created 
from dbo.UpdateLog group by id
), cteLatest as
(select h.* from ctehistory h
inner join ctelatestcreated l
on h.id = l.id 
and 
h.created = l.created
)
select * from cteLatest


--DECLARE @isActive bit = 1

--update u
--set JsonUpdate = JSON_MODIFY(JsonUpdate, '$.IsActive', @isActive)
----select JsonUpdate
--from dbo.UpdateLog u
--where id = '1c40501a-35cb-4c4e-8f9c-2c6e1e888dee'
--and
--created = '2023-11-17T14:52:44.977'