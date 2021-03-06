DROP TABLE IF EXISTS `slide`;
DROP TABLE IF EXISTS `queue`;
DROP TABLE IF EXISTS `log`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `queue` (
	`id` INTEGER PRIMARY KEY AUTO_INCREMENT,         -- ID of queue
	`name` TEXT NOT NULL,                            -- Name of queue
	`loop` TINYINT NOT NULL DEFAULT 1                -- 1 if looping is enabled, 0 if disabled.
) ENGINE=INNODB AUTO_INCREMENT=100;

CREATE TABLE `slide` (
	id INTEGER PRIMARY KEY AUTO_INCREMENT,          -- ID of the slide
	queue_id INTEGER NOT NULL,                      -- Queue ID the slide belong to
	`timestamp` TIMESTAMP NOT NULL,                 -- Last time the slide was updated
	path TEXT NOT NULL,                             -- Path to slide
	sortorder INTEGER NOT NULL DEFAULT 0,           -- Sort order index, ASC
	active TINYINT NOT NULL DEFAULT 1,              -- 1 if enabled, 0 if disabled
	assembler TEXT NOT NULL,                        -- Which assember is used to rasterize source data
	data BLOB NOT NULL,
  FOREIGN KEY (queue_id) REFERENCES queue(id)
) ENGINE=INNODB;

CREATE TABLE `log` (
       id INTEGER PRIMARY KEY AUTO_INCREMENT,
       type INTEGER NOT NULL,
       severity INTEGER NOT NULL,
       stamp TIMESTAMP NOT NULL,
       user_id INTEGER NOT NULL DEFAULT 1 REFERENCES user(id),
       message TEXT NOT NULL
) ENGINE=InnoDB;

-- User table
-- user/host tuple is used for matching, a host may be specified instead of a username or even both.
CREATE TABLE `user` (
       id INTEGER PRIMARY KEY AUTO_INCREMENT,
       name TEXT,
       host TEXT
) ENGINE=InnoDB;

-- Database schema migrations.
-- Each row contains a filename with a migration that has been executed.
CREATE TABLE `migration` (
       `filename` VARCHAR(255) PRIMARY KEY,
       `timestamp` TIMESTAMP NOT NULL
);
INSERT INTO `migration` VALUES ('20120426184724_add_timestamp_to_slide.sql', CURRENT_TIMESTAMP);    -- Included in schema

COMMIT;
