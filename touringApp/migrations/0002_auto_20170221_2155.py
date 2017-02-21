# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-02-21 12:55
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('touringApp', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pass',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField()),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('route', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='touringApp.Route')),
            ],
        ),
        migrations.RemoveField(
            model_name='routepass',
            name='route',
        ),
        migrations.DeleteModel(
            name='RoutePass',
        ),
    ]
