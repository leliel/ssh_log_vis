-- MySQL dump 10.13  Distrib 5.1.67, for -netbsdelf (i486)
--
-- Host: depot    Database: leliel_engr489_2013
-- ------------------------------------------------------
-- Server version       5.1.67

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

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `leliel_engr489_2013` /*!40100 DEFAULT CHARACTER SET latin1 */;

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
  `rawline` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `server_entry_ind` (`server`),
  KEY `user_entry_ind` (`user`),
  CONSTRAINT `entry_ibfk_1` FOREIGN KEY (`server`) REFERENCES `server` (`id`),
  CONSTRAINT `entry_ibfk_2` FOREIGN KEY (`user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `freq_loc`
--

DROP TABLE IF EXISTS `freq_loc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `freq_loc` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user` int(10) unsigned NOT NULL,
  `count` int(10) unsigned NOT NULL DEFAULT '1',
  `country` char(2) NOT NULL,
  `city` char(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_loc` (`user`,`country`,`city`),
  KEY `freq_loc_user` (`user`),
  CONSTRAINT `freq_loc_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `freq_time`
--

DROP TABLE IF EXISTS `freq_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `freq_time` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user` int(10) unsigned DEFAULT NULL,
  `start` time NOT NULL,
  `end` time NOT NULL,
  `count` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_time_ind` (`user`),
  CONSTRAINT `freq_time_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE
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
  `postalCode` char(10) DEFAULT NULL,
  `latitude` decimal(8,4) NOT NULL,
  `longitude` decimal(8,4) NOT NULL,
  `metroCode` int(11) DEFAULT NULL,
  `areaCode` int(11) DEFAULT NULL,
  KEY `geo_loc` (`locId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
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
  KEY `ip_loc` (`locId`)
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
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
  `isvalid` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  KEY `users` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=41848 DEFAULT CHARSET=latin1;
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
/*!50003 CREATE*/ /*!50020 DEFINER=`leliel`@`%`*/ /*!50003 PROCEDURE `freq_loc_add`(IN userId INT UNSIGNED, IN country CHAR(2), IN city CHAR(50))
BEGIN DECLARE i INT DEFAULT 0; DECLARE id INT UNSIGNED; DECLARE count INT UNSIGNED; SELECT COUNT(*), freq_loc.id, freq_loc.count INTO i, id, count FROM freq_loc WHERE freq_loc.user = userId AND freq_loc.country=country AND freq_loc.city=city; IF i > 0 THEN  UPDATE freq_loc SET freq_loc.count=count+1 WHERE freq_loc.id=id; ELSE INSERT INTO freq_loc VALUES (DEFAULT, userid, DEFAULT, country, city); END IF; END */;;
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
/*!50003 CREATE*/ /*!50020 DEFINER=`leliel`@`%`*/ /*!50003 PROCEDURE `insert_server`(IN n CHAR(50), OUT id INT UNSIGNED)
BEGIN INSERT INTO server VALUES(DEFAULT, n, NULL); SET id = LAST_INSERT_ID(); END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `insert_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50020 DEFINER=`leliel`@`%`*/ /*!50003 PROCEDURE `insert_user`(IN n CHAR(50), IN isValid BOOLEAN, OUT id INT UNSIGNED)
BEGIN INSERT INTO user VALUES(DEFAULT, n, isValid); SET id = LAST_INSERT_ID(); END */;;
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