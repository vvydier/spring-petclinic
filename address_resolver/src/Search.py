import json
from flask import current_app
import pystache


class PostcodeSearch():
    query_renderer = pystache.Renderer()

    def __init__(self, post_code=None):
        self.post_code = post_code


    def post_code(self):
        return self._post_code

    def query(self):
        query = json.loads(self.query_renderer.render(self))
        results = current_app.elasticsearch.search(index=current_app.config['ADDRESS_INDEX'], doc_type='doc', body=query)
        return {
            "addresses":[result["_source"] for result in results["hits"]["hits"]]
        }


class AddressSearch(PostcodeSearch):
    query_renderer = pystache.Renderer()

    def __init__(self, post_code, address):
        super().__init__(post_code)
        self.address = address

    def address(self):
        return self._address

    def query(self):
        query = json.loads(self.query_renderer.render(self))
        results = current_app.elasticsearch.search(index=current_app.config['ADDRESS_INDEX'], doc_type='doc', body=query)
        return {
            "addresses":[result["_source"] for result in results["hits"]["hits"]],
            "query":query
        }
