# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-02-23 14:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('touringApp', '0002_auto_20170221_2155'),
    ]

    operations = [
        migrations.AlterField(
            model_name='route',
            name='log_date',
            field=models.DateField(verbose_name='date of the touring'),
        ),
    ]
