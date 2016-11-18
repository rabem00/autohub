# DashOPS and Automation Hub
A flask and bootstrap project for OPS dashboard and an Automation Hub.
==================================================

Quickstart
----------

1. clone this repository
2. place it on one of your ceph monitor nodes
3. run ```dashops.py```
4. point your browser to http://yourip:5000/
5. enjoy!

**If you want to change the port number:**

The development server of DashOPS runs by default on port 5000. Change the following line in `dashops.py` if you want to run on another port:
```python
app.run(host='0.0.0.0', debug=True)
```
to
```python
app.run(host='0.0.0.0', port=8080, debug=True)
```
Please keep in mind that the development server should not be used in a production environment!<br>
DashOPS should be deployed into a proper webserver like for instance Nginx.

Dashboard
---------

Go to the DashOPS address via a browser, you will see the web frontend. This will inform you on a single page about all important things of your cluster(s).

REST Api
--------

If you access the address via commandline tools or programming languages, use ```content-type: application/json``` and you will get all the information as a json output.

Deployment
----------

You may want to deploy this wsgi application into a real webserver like for instance nginx.<br>
You can edit the config.json file to configure how to talk to the cluster(s) in your datacenters.

 - `dashops_config` is the location of /etc/dashops/dashops.conf

 TODO: app config items add.

Setup server
----------

Install a CentOS 7 machine and update as usual. Install these requirements:
```
yum -y install httpd mod_wsgi mod_ssl
systemctl start httpd
systemctl enable httpd
```

Under the regular httpd directory put the dashops app:
```
cd /var/www/html
git clone <repo>
```

Add a new httpd virtual host configuration:
```
vi /etc/httpd/conf.d/dashops.conf
```

Paste the following content (or simular):
```
<VirtualHost *:80>
ServerName <yourservername>

RewriteEngine On
RewriteCond %{REQUEST_URI} !^/server-status
RewriteRule ^/?(.*) https://%{HTTP_HOST}/$1 [R,L]
</VirtualHost>

<VirtualHost *:443>
ServerName <yourservername>

WSGIDaemonProcess dashops user=apache group=apache processes=1 threads=5
WSGIScriptAlias / /var/www/html/dashops/contrib/wsgi/dashops.wsgi
WSGIPassAuthorization On

SSLEngine on
SSLCertificateFile /etc/httpd/ssl/apache.crt
SSLCertificateKeyFile /etc/httpd/ssl/apache.key

<Directory /var/www/html/dashops>
WSGIProcessGroup dashops
WSGIApplicationGroup %{GLOBAL}
Order allow,deny
Allow from all
</Directory>
</VirtualHost>
```

Create a self-signed certificate for Apache:
```
mkdir /etc/httpd/ssl/
 openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/httpd/ssl/apache.key -out /etc/httpd/ssl/apache.crt
```

And restart the httpd.service:
```
systemctl restart httpd.service
```
