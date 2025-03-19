from flask import Blueprint

auth = Blueprint("auth", __name__)

from . import routes  # Import des routes après la création du Blueprint
