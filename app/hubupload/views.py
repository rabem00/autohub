#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import json

from flask import request
from flask import render_template
from flask import abort
from flask import jsonify
from flask import current_app
from flask import redirect
from flask.views import MethodView
from app.base import ApiResource

class HubResourceUpload(ApiResource):
    """
    Endpoint that shows latest status of the uploaded automation scripts
    """

    endpoint = 'hubupload'
    url_prefix = '/out'
    url_rules = {
        'index': {
            'rule': '/post',
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
            return render_template('upload.html', data=input_status, config=self.config)

    def post(post):
        name=request.form['scriptname']
        description=request.form['description']
        selecttype=request.form['selecttype']
        keywordlist=request.form['keywordlist']
        inputfile=request.form['inputfile']

        with open('./testdata.json','rw') as data_file:
            input_status = json.load(data_file)
        data_file.close()

        input_status["maps"].append({ "id": "3", "name": name, "type": selecttype, "email": "get from user", "keyword": keywordlist, "detail": { "description": description, "uploaddate": "18/11/2016", "lastmod": "18/11/2016", "link": "http://147.181.7.145/root/marco" } })

        with open('./testdata.json','w') as data_file:
            json.dump(input_status, data_file)
        data_file.close()
        return redirect('/')
