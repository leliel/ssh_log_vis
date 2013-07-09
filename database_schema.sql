-- MySQL dump 10.13  Distrib 5.1.67, for unknown-linux-gnu (x86_64)
--
-- Host: depot    Database: leliel_engr489_2013
-- ------------------------------------------------------
-- Server version	5.1.67

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `leliel_engr489_2013`
--

USE `leliel_engr489_2013`;

--
-- Table structure for table `entry`
--

DROP TABLE IF EXISTS `entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `entry` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `server` int(10) unsigned DEFAULT NULL,
  `connid` int(10) unsigned NOT NULL,
  `reqtype` enum('connect','disconnect','subsystem','invalid','other') DEFAULT NULL,
  `authtype` enum('pass','host','key','gssapi','none') DEFAULT NULL,
  `status` enum('accepted','failed') DEFAULT NULL,
  `user` int(10) unsigned DEFAULT NULL,
  `source` char(15) DEFAULT NULL,
  `port` smallint(5) unsigned DEFAULT NULL,
  `subsystem` enum('sftp','scp') DEFAULT NULL,
  `code` int(11) DEFAULT NULL,
  `isfreqtime` int(10) unsigned DEFAULT NULL,
  `isfreqloc` int(11) DEFAULT NULL,
  `rawline` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `server_entry_ind` (`server`),
  KEY `user_entry_ind` (`user`),
  KEY `time_idx` (`timestamp`),
  KEY `entry_freq_loc` (`isfreqloc`),
  KEY `entry_freq_time` (`isfreqtime`),
  CONSTRAINT `entry_ibfk_1` FOREIGN KEY (`server`) REFERENCES `server` (`id`),
  CONSTRAINT `entry_ibfk_2` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  CONSTRAINT `entry_ibfk_3` FOREIGN KEY (`isfreqloc`) REFERENCES `freq_loc` (`id`),
  CONSTRAINT `entry_ibfk_4` FOREIGN KEY (`isfreqtime`) REFERENCES `freq_time` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37000 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `freq_loc`
--

DROP TABLE IF EXISTS `freq_loc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `freq_loc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(10) unsigned NOT NULL,
  `locId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `freq_loc_user` (`user`),
  KEY `freq_loc_locId` (`locId`),
  CONSTRAINT `freq_loc_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  CONSTRAINT `freq_loc_ibfk_2` FOREIGN KEY (`locId`) REFERENCES `geo` (`locId`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `freq_loc_links`
--

DROP TABLE IF EXISTS `freq_loc_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `freq_loc_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `freq_loc_id` int(11) NOT NULL,
  `creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `timetolive` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `freq_loc_link_loc` (`freq_loc_id`),
  CONSTRAINT `freq_loc_links_ibfk_2` FOREIGN KEY (`freq_loc_id`) REFERENCES `freq_loc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `freq_time`
--

DROP TABLE IF EXISTS `freq_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `freq_time` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user` int(10) unsigned NOT NULL,
  `start` time NOT NULL,
  `end` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_time_ind` (`user`),
  CONSTRAINT `freq_time_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `freq_time_links`
--

DROP TABLE IF EXISTS `freq_time_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `freq_time_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `freq_time_id` int(10) unsigned NOT NULL,
  `creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `timetolive` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_freq_time_id` (`freq_time_id`),
  CONSTRAINT `freq_time_links_ibfk_1` FOREIGN KEY (`freq_time_id`) REFERENCES `freq_time` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `geo`
--

DROP TABLE IF EXISTS `geo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `geo` (
  `locId` int(11) NOT NULL,
  `country` char(2) NOT NULL,
  `region` char(50) DEFAULT NULL,
  `city` char(50) DEFAULT NULL,
  `postCode` char(10) DEFAULT NULL,
  `latitude` decimal(8,4) NOT NULL,
  `longitude` decimal(8,4) NOT NULL,
  `metroCode` int(11) DEFAULT NULL,
  `areaCode` int(11) DEFAULT NULL,
  PRIMARY KEY (`locId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ip`
--

DROP TABLE IF EXISTS `ip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ip` (
  `startIpNum` int(10) unsigned NOT NULL,
  `endIpNum` int(10) unsigned NOT NULL,
  `locId` int(10) unsigned NOT NULL,
  `ip_poly` polygon NOT NULL,
  KEY `ip_loc` (`locId`),
  SPATIAL KEY `ip_spatial` (`ip_poly`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `links`
--

DROP TABLE IF EXISTS `links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `server1` int(10) unsigned DEFAULT NULL,
  `server2` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `serv1_ind` (`server1`),
  KEY `serv2_ind` (`server2`),
  CONSTRAINT `links_ibfk_1` FOREIGN KEY (`server1`) REFERENCES `server` (`id`) ON DELETE CASCADE,
  CONSTRAINT `links_ibfk_2` FOREIGN KEY (`server2`) REFERENCES `server` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `server`
--

DROP TABLE IF EXISTS `server`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `server` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` char(100) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `block` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` char(50) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  KEY `users` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21127 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'leliel_engr489_2013'
--
/*!50003 DROP PROCEDURE IF EXISTS `freq_loc_add` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`leliel`@`%` PROCEDURE `freq_loc_add`(in name int, in loc int, in ttl int, out num int, out ids int)
begin
declare temp int default null;
select freq_loc.id into temp from freq_loc where freq_loc.user=name and freq_loc.locId=loc;
if temp is null then
insert into freq_loc value(default, name, loc);
set ids = last_insert_id();
insert into freq_loc_links value(default, ids, default, ttl);
set num = 1;
else
delete from freq_loc_links where freq_loc_id=temp and timestampadd(second, freq_loc_links.ttl, freq_loc_links.creation) <= now();
insert into freq_loc_links value(default, temp, default, ttl);
select count(freq_loc_links.id) into num from freq_loc_links left join freq_loc on freq_loc_links.freq_loc_id=freq_loc.id where freq_loc.id=temp group by freq_loc_id;
set ids = temp;
end if;
end;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `freq_loc_check` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`leliel`@`%`PROCEDURE `freq_loc_check`(in name int, in loc int, out num int, out ids int)
begin
declare temp int default null;
select freq_loc.id into temp from freq_loc where freq_loc.user=name and freq_loc.locId=loc;
if temp is null then
set ids = -1;
set num = -1;
else
delete from freq_loc_links where freq_loc_id=temp and timestampadd(second, freq_loc_links.ttl, freq_loc_links.creation) <= now();
select count(freq_loc_links.id) into num from freq_loc_links left join freq_loc on freq_loc_links.freq_loc_id=freq_loc.id where freq_loc.id=temp group by freq_loc_id;
set ids = temp;
end if;
end;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `freq_time_add` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`leliel`@`%` PROCEDURE `freq_time_add`(in name int, in timeHappened datetime, in allowance time, in ttl int, out num int, out ids int)
begin
declare temp int default null;
select freq_time.id into temp from freq_time where freq_time.user=name and timeHappened between freq_time.start and freq_time.end;
if temp is null then
insert into freq_time value(default, name, subtime(timeHappened, allowance), addtime(timeHappened, allowance));
set ids = last_insert_id();
insert into freq_time_links value(default, ids, default, ttl);
set num = 1;
else
delete from freq_time_links where freq_time_id=temp and timestampadd(second, freq_time_links.ttl, freq_time_links.creation) <= now();
insert into freq_time_links value(default, temp, default, ttl);
select count(freq_time_links.id) into num from freq_time_links left join freq_time on freq_time_links.freq_time_id=freq_time.id where freq_time.id=temp group by freq_time_id;
set ids = temp;
end if;
end;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `freq_time_check` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`leliel`@`%` PROCEDURE `freq_time_check`(in name int, in loc time, in ttl int, out num int, out ids int)
begin
declare temp int default null;
select freq_time.id into temp from freq_time where freq_time.user=name and loc between freq_time.start and freq_time.end;
if temp is null then
set ids = -1;
set num = -1;
else
delete from freq_time_links where freq_time_id=temp and timestampadd(second, ttl, freq_time_links.creation) <= now();
select count(freq_time_links.id) into num from freq_time_links left join freq_time on freq_time_links.freq_time_id=freq_time.id where freq_time.id=temp group by freq_time_id;
set ids = temp;
end if;
end;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `insert_server` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`leliel`@`%` PROCEDURE `insert_server`(IN n CHAR(50), OUT id INT UNSIGNED)
BEGIN INSERT INTO server VALUES(DEFAULT, n, NULL); SET id = LAST_INSERT_ID(); END;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `insert_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`leliel`@`%` PROCEDURE `insert_user`(IN name CHAR(50), OUT id INT UNSIGNED)
BEGIN
INSERT INTO user VALUES(DEFAULT, name);
SET id = LAST_INSERT_ID();
END;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-07-09 13:28:45
