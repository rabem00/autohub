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

class HubResource(ApiResource):
    """
    Endpoint that shows latest status of the uploaded automation scripts
    """

    endpoint = 'hub'
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
            input_status = json.load(data_file)
        if request.mimetype == 'application/json':
            return jsonify(input_status)
        else:
            return render_template('latest.html', data=input_status, config=self.config)
