async def convert_mongo_document(document):
    if '_id' in document:
        document['id'] = str(document['_id'])
        del document['_id']
    return document