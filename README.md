# TourServer
Server
<!-- 1. 所有参数都以驼峰命名 -->

<!-- select DATE_FORMAT(t_content.create_time,'%T')as time ,
CASE (DATE_FORMAT(now(),"%y%m%d")-DATE_FORMAT(t_content.create_time,"%y%m%d"))
WHEN 0 THEN  CONCAT('今天',DATE_FORMAT(t_content.create_time,'%T')) 
WHEN 1 then CONCAT('昨天',DATE_FORMAT(t_content.create_time,'%T'))
WHEN 2 then CONCAT('前天',DATE_FORMAT(t_content.create_time,'%T'))
ELSE DATE_FORMAT(t_content.create_time,"20%y-%m-%d") END as dataTime 
from t_content  -->
