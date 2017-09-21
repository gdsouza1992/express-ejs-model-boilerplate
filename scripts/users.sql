CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `username` varchar(64) DEFAULT NULL,
  `password` varchar(64) NOT NULL,
  `avatar_url` varchar(256) NOT NULL DEFAULT '',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `k_deleted` (`deleted`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;

INSERT INTO `users` (`id`, `email`, `email_verified`, `username`, `password`, `avatar_url`, `deleted`, `createdAt`, `updatedAt`)
VALUES
	(11, 'test0@test.com', 1, 'test0', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(12, 'test1@test.com', 1, 'test1', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(13, 'test2@test.com', 1, 'test2', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(14, 'test3@test.com', 1, 'test3', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(15, 'test4@test.com', 1, 'test4', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(16, 'test5@test.com', 1, 'test5', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(17, 'test6@test.com', 1, 'test6', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(18, 'test7@test.com', 1, 'test7', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(19, 'test8@test.com', 1, 'test8', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(20, 'test9@test.com', 1, 'test9', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(21, 'test10@test.com', 1, 'test10', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(22, 'test11@test.com', 1, 'test11', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(23, 'test12@test.com', 1, 'test12', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(24, 'test13@test.com', 1, 'test13', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(25, 'test14@test.com', 1, 'test14', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(26, 'test15@test.com', 1, 'test15', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(27, 'test16@test.com', 1, 'test16', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(28, 'test17@test.com', 1, 'test17', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(29, 'test18@test.com', 1, 'test18', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07'),
	(30, 'test19@test.com', 1, 'test19', 'test', '', 0, '2017-09-21 11:37:19', '2017-09-21 11:38:07');
