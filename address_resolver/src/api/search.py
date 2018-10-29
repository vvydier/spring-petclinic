from flask import jsonify, app
from flask import request


from Search import PostcodeSearch, AddressSearch
from api import bp


@bp.route('/find_address', methods=['POST'])
def find_address():
    if request.method == 'POST':
        if request.headers['Content-Type'] == 'application/json':
            req_data = request.get_json()
            if not 'post_code' in req_data:
                return jsonify({"success": False, "message": "Postcode is required"}), 404
            if not 'address' in req_data:
                response = PostcodeSearch(post_code=req_data['post_code']).query()
            else:
                response = AddressSearch(post_code=req_data['post_code'],address=req_data['address']).query()
                response['success'] = True
            return jsonify(response), 200

        else:
            return jsonify({"success": False, "message": "415 Unsupported Media Type"}), 415
