from datetime import datetime, timedelta
from flask import jsonify
import jwt

def generate_token(user_id,app):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(payload,app.config['SECRET_KEY'], algorithm='HS256')
    
    return token
    
def decode_token(token,app):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    

def verify_user(headers,app):
    bearer_token = headers.get('Authorization')

    if bearer_token.startswith('Bearer '):
        clean_token = bearer_token[7:]
    else:
        clean_token = bearer_token
    if not clean_token:
        return False, jsonify({"status": "failure", "message": "Missing or invalid token"}), 401
    user_id = decode_token(clean_token,app)
    if not user_id:
        return False, jsonify({"status": "failure", "message": "Invalid or expired token"}), 401

    else:
        return True, user_id
