from flask import jsonify, app
from flask import request

from Search import StateSearch, CitySearch, AddressSearch
from api import bp



def check_parameters(req, params):
    missing = []
    for param in params:
        if not param in req:
            missing.append("%s is required" % param)
    return missing

@bp.route('/find_state', methods=['POST'])
def find_state():
    if request.method == 'POST':
        if request.headers['Content-Type'] == 'application/json':
            req_data = request.get_json()
            missing = check_parameters(req_data, ["zip_code"])
            if len(missing) > 0:
                return jsonify({"success": False, "message": missing}), 404
            response = StateSearch(zip_code=req_data['zip_code']).query()
            response['success'] = True
            return jsonify(response), 200

        else:
            return jsonify({"success": False, "message": "415 Unsupported Media Type"}), 415


@bp.route('/find_city', methods=['POST'])
def find_city():
    if request.method == 'POST':
        if request.headers['Content-Type'] == 'application/json':
            req_data = request.get_json()
            missing = check_parameters(req_data, ["zip_code","state"])
            if len(missing) > 0:
                return jsonify({"success": False, "message": missing}), 404
            response = CitySearch(zip_code=req_data['zip_code'], state=req_data['state']).query()
            response['success'] = True
            return jsonify(response), 200

        else:
            return jsonify({"success": False, "message": "415 Unsupported Media Type"}), 415


@bp.route('/find_address', methods=['POST'])
def find_address():
    if request.method == 'POST':
        if request.headers['Content-Type'] == 'application/json':
            req_data = request.get_json()
            missing = check_parameters(req_data, ["zip_code","state","city","address"])
            if len(missing) > 0:
                return jsonify({"success": False, "message": missing}), 404
            response = AddressSearch(zip_code=req_data['zip_code'], state=req_data['state'], city=req_data['city'], address=req_data['address']).query()
            response['success'] = True
            return jsonify(response), 200

        else:
            return jsonify({"success": False, "message": "415 Unsupported Media Type"}), 415
