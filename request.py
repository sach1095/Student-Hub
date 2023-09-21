from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import BackendApplicationClient
from pygments import highlight, lexers, formatters

import sys
import json
import os
import time
from builtins import input


def call(api, endpoint):
    response = api.get('https://api.intra.42.fr/v2/' + endpoint)
    raw_json = response.content
    return raw_json

def print_results(raw_json, endpoint):
    try:
        endpoint = endpoint.replace("/", "_")
        endpoint = endpoint.replace(":", "_")
        endpoint = endpoint.replace("?", "_")
        endpoint = endpoint.replace(" ", "_")
        with open(f"{endpoint}.json", "w") as file:
            file.write(str(raw_json))
        print(f"Success, result in {endpoint}.json")
    except:
        print(raw_json)

def prompt(api):
    if len(sys.argv) <= 1:
        if sys.stdout.isatty():
            sys.stderr.write(str("\033[91m> https://api.intra.42.fr/v2/\033[0m"))
        endpoint = input()
        print_results(call(api, endpoint), endpoint)
        prompt(api)
    else:
        endpoint = sys.argv[1]
        print_results(call(api, endpoint))


def init_api():
    client = BackendApplicationClient(client_id=client_id)
    api = OAuth2Session(client=client)
    try:
        token = api.fetch_token(token_url='https://api.intra.42.fr/oauth/token', client_id=client_id, client_secret=client_secret)
    except:
        print("Error, invalid credential")
        exit()
    return(api)


if __name__ == "__main__":
    try:
        global client_id
        client_id = input("client id: ")
        global client_secret
        client_secret = input("client secret: ")
        api = init_api()
        prompt(api)
    except KeyboardInterrupt:
        sys.exit()
