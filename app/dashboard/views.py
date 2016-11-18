#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import json

from flask import request
from flask import render_template
from flask import abort
from flask import jsonify
from flask import current_app
from flask.views import MethodView

from app.base import ApiResource

class DashboardResource(ApiResource):
    """
    Endpoint that shows overall OPS dashboard.
    """

    endpoint = 'dashboard'
    url_prefix = '/'
    url_rules = {
        'index': {
            'rule': '/',
        }
    }

    def __init__(self):
        MethodView.__init__(self)
        self.config = current_app.config['USER_CONFIG']

    def get(self):
        with open('./testdata.json') as data_file:
            cluster_status = json.load(data_file)
            #print json.dumps(cluster_status, ensure_ascii=False)
        if request.mimetype == 'application/json':
            return jsonify(cluster_status)
        else:
            return render_template('status.html', data=cluster_status, config=self.config)
