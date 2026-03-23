from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('talkshow_backend', '0018_episode_is_new_guestprofile_is_new_talent_is_new'),
    ]

    operations = [
        # Check for VideoComment existence before creating
        migrations.RunSQL(
            sql="CREATE TABLE IF NOT EXISTS `talkshow_backend_videocomment` ("
                "`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, "
                "`text` longtext NOT NULL, "
                "`created_at` datetime(6) NOT NULL, "
                "`talent_video_id` bigint NOT NULL, "
                "`user_id` bigint NOT NULL"
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
            reverse_sql="DROP TABLE IF EXISTS `talkshow_backend_videocomment`;"
        ),
        migrations.RunSQL(
            sql="CREATE TABLE IF NOT EXISTS `talkshow_backend_videolike` ("
                "`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, "
                "`created_at` datetime(6) NOT NULL, "
                "`talent_video_id` bigint NOT NULL, "
                "`user_id` bigint NOT NULL, "
                "UNIQUE (`user_id`, `talent_video_id`)"
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
            reverse_sql="DROP TABLE IF EXISTS `talkshow_backend_videolike`;"
        ),
        # Add foreign key constraints if needed, but IF NOT EXISTS is safer for now
        migrations.RunSQL(
            sql="ALTER TABLE `talkshow_backend_videocomment` ADD CONSTRAINT `videocomment_talent_video_id_fk` FOREIGN KEY (`talent_video_id`) REFERENCES `talkshow_backend_talent` (`id`) ON DELETE CASCADE;",
            reverse_sql="ALTER TABLE `talkshow_backend_videocomment` DROP FOREIGN KEY `videocomment_talent_video_id_fk`;"
        ),
        migrations.RunSQL(
            sql="ALTER TABLE `talkshow_backend_videocomment` ADD CONSTRAINT `videocomment_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `talkshow_backend_registration` (`id`) ON DELETE CASCADE;",
            reverse_sql="ALTER TABLE `talkshow_backend_videocomment` DROP FOREIGN KEY `videocomment_user_id_fk`;"
        ),
        migrations.RunSQL(
            sql="ALTER TABLE `talkshow_backend_videolike` ADD CONSTRAINT `videolike_talent_video_id_fk` FOREIGN KEY (`talent_video_id`) REFERENCES `talkshow_backend_talent` (`id`) ON DELETE CASCADE;",
            reverse_sql="ALTER TABLE `talkshow_backend_videolike` DROP FOREIGN KEY `videolike_talent_video_id_fk`;"
        ),
        migrations.RunSQL(
            sql="ALTER TABLE `talkshow_backend_videolike` ADD CONSTRAINT `videolike_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `talkshow_backend_registration` (`id`) ON DELETE CASCADE;",
            reverse_sql="ALTER TABLE `talkshow_backend_videolike` DROP FOREIGN KEY `videolike_user_id_fk`;"
        ),
    ]
