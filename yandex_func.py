import pandas as pd
import numpy as np
from collections import defaultdict
import surprise
import os
import base64
import json

import surprise
from surprise import KNNBasic, BaselineOnly, NormalPredictor, SVD
from surprise.model_selection import cross_validate, train_test_split
from surprise import accuracy

err_response = {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'text/plain'
            },
            'isBase64Encoded': False,
            'body': 'Server-side error. Maybe your data is invalid.'
        }

def get_top_n(predictions, n=10):
    """Return the top-N recommendation for each user from a set of predictions.

    Args:
        predictions(list of Prediction objects): The list of predictions, as
            returned by the test method of an algorithm.
        n(int): The number of recommendation to output for each user. Default
            is 10.

    Returns:
    A dict where keys are user (raw) ids and values are lists of tuples:
        [(raw item id, rating estimation), ...] of size n.
    """

    # First map the predictions to each user.
    top_n = defaultdict(list)
    for uid, iid, true_r, est, _ in predictions:
        top_n[uid].append((iid, est))

    # Then sort the predictions for each user and retrieve the k highest ones.
    for uid, user_ratings in top_n.items():
        user_ratings.sort(key=lambda x: x[1], reverse=True)
        top_n[uid] = user_ratings[:n]

    return top_n

def handler(event, context):
    try:
        # print(event)

        event = base64.b64decode(event['body']).decode('utf-8')
        print(event)
        event = json.loads(event)
        df = pd.DataFrame(event['table'])

        # df.user_id = df.user_id.astype(np.int)
        # df.item_id = df.item_id.astype(np.int)
        reader = surprise.Reader(rating_scale=(df.rating.min(), df.rating.max()))
        data = surprise.Dataset.load_from_df(df, reader)

        if event['purpose'] == 'eval':
            metrics = {
                "baseline": {
                    'RMSE' : 0.0,
                    'MAE' : 0.0
                },
                "pearson": {
                    'RMSE' : 0.0,
                    'MAE' : 0.0
                },
                "cosine": {
                    'RMSE' : 0.0,
                    'MAE' : 0.0
                },
                "SVD": {
                    'RMSE' : 0.0,
                    'MAE' : 0.0
                },
                "random": {
                    'RMSE' : 0.0,
                    'MAE' : 0.0
                }
            }
            trainset, testset = train_test_split(data, test_size=.25)
            bsl_options = {'method': 'sgd',
                        'learning_rate': .001,
                        }
            algo = BaselineOnly(bsl_options=bsl_options)

            algo.fit(trainset)
            predictions = algo.test(testset)

            metrics['baseline']['RMSE'] = accuracy.rmse(predictions)
            metrics['baseline']['MAE'] = accuracy.mae(predictions)

            algo = NormalPredictor()

            algo.fit(trainset)
            predictions = algo.test(testset)

            metrics['random']['RMSE'] = accuracy.rmse(predictions)
            metrics['random']['MAE'] = accuracy.mae(predictions)

            algo = SVD()

            algo.fit(trainset)
            predictions = algo.test(testset)

            metrics['SVD']['RMSE'] = accuracy.rmse(predictions)
            metrics['SVD']['MAE'] = accuracy.mae(predictions)

            sim_options = {'name': 'cosine',
                        'user_based': True  
                        }
            algo = KNNBasic(sim_options=sim_options)

            algo.fit(trainset)
            predictions = algo.test(testset)

            metrics['cosine']['RMSE'] = accuracy.rmse(predictions)
            metrics['cosine']['MAE'] = accuracy.mae(predictions)

            sim_options = {'name': 'pearson_baseline',
                        'shrinkage': 0  # no shrinkage
                        }
            algo = KNNBasic(sim_options=sim_options)

            algo.fit(trainset)
            predictions = algo.test(testset)

            metrics['pearson']['RMSE'] = accuracy.rmse(predictions)
            metrics['pearson']['MAE'] = accuracy.mae(predictions)

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/plain'
                },
                'isBase64Encoded': False,
                'body': metrics
            }
        elif event['purpose'] == 'train':
            trainset = data.build_full_trainset()
            testset = trainset.build_anti_testset()
            algo = None

            if event['selectedMethod'] == 2:
                algo = SVD()
                algo.fit(trainset)

            elif event['selectedMethod'] == 4:
                sim_options = {'name': 'cosine',
                        'user_based': True  
                        }
                algo = KNNBasic(sim_options=sim_options)
                algo.fit(trainset)

            elif event['selectedMethod'] == 5:
                sim_options = {'name': 'pearson_baseline',
                        'shrinkage': 0  # no shrinkage
                        }
                algo = KNNBasic(sim_options=sim_options)
                algo.fit(trainset)

            elif event['selectedMethod'] == 3: 
                bsl_options = {'method': 'sgd',
                        'learning_rate': .001,
                        }
                algo = BaselineOnly(bsl_options=bsl_options)
                algo.fit(trainset)

            elif event['selectedMethod'] == 1:
                algo = NormalPredictor()
                algo.fit(trainset)
            else:
                return err_response

            predictions = algo.test(testset)
            top_n = get_top_n(predictions, n=100)
            return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/plain'
            },
            'isBase64Encoded': False,
            'body': top_n
            }
        else:
            return err_response
    except Exception as e:
        print(e)
        return err_response
