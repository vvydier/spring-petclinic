from elasticsearch import Elasticsearch
from flask import Flask

from api import bp as api_bp
from config import Config
from elasticapm.contrib.flask import ElasticAPM


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.elasticsearch = Elasticsearch(hosts=[app.config['ELASTICSEARCH_URL']], http_auth=(app.config['ELASTICSEARCH_USER'],app.config['ELASTICSEARCH_PASSWORD']), timeout=60)
    app.register_blueprint(api_bp, url_prefix='/api')
    apm = ElasticAPM(app)
    return app
