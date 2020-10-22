import json


STATIC_SECURITY_HEADERS = {
    'Content-Security-Policy': '; '.join([
        "base-uri 'none'",
        "connect-src 'self' API_DOMAIN",
        "default-src 'none'",
        "font-src 'self'",
        "form-action 'none'",
        "frame-ancestors 'self'",
        "frame-src 'self'",
        "img-src 'self'",
        "object-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "style-src-elem 'self' 'unsafe-inline'",
    ]),
    'Expect-CT': 'Expect-CT: max-age=604800, enforce',
    'Feature-Policy': "autoplay 'none'; camera 'none'; microphone 'none'",
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
}


def add_security_headers(headers, api_url):
    api_domain = api_url[:api_url.find('/', 8)]
    for header, value in STATIC_SECURITY_HEADERS.items():
        if header == 'Content-Security-Policy':
            value = value.replace('API_DOMAIN', api_domain)
        headers[header] = [{
            'key': header,
            'value': value,
        }]


def lambda_handler(event, context):
    print(f'Event Received: {json.dumps(event)}')
    cf = event['Records'][0]['cf']
    response = cf['response']
    custom_headers = cf['request']['origin']['s3']['customHeaders']
    api_url = custom_headers['api_url'][0]['value']
    add_security_headers(response['headers'], api_url)
    print(f'Returning Response: {json.dumps(response)}')
    return response
