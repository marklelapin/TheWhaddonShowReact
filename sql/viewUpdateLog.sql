with cteUpdateLog as (
select Id,
Created,
UpdateType,
JSON_VALUE(JsonUpdate, '$.ParentId') as ParentId,
JSON_VALUE(JsonUpdate, '$.Type') as [Type],
JSON_VALUE(JsonUpdate, '$.Text') as [Text],
JSON_VALUE(JsonUpdate, '$.PreviousId') as PreviousId,
JSON_VALUE(JsonUpdate, '$.NextId') as NextId,
JSON_VALUE(JsonUpdate, '$.IsActive') as IsActive

from dbo.UpdateLog
)
select *
FROM cteUpdateLog
Where ParentId = '939bae54-7b2e-45fa-b247-46fc937ae5ec' OR Id = '939bae54-7b2e-45fa-b247-46fc937ae5ec'
order by Created asc

update u
set u.JsonUpdate = JSON_MODIFY(u.JsonUpdate, '$.NextId', NULL)
--select *
from dbo.UpdateLog  u
where Id = '3C5FE9D7-D045-4503-9E98-0AB7C3C2B6BD'
AND Created = '2023-12-16 08:32:12.6260000'

