import { fauna } from "../../../services/fauna";
import { query as q } from 'faunadb';
import { stripe } from "../../../services/stripe";

export async function saveSubscrition(subscritionId: string, customerId: string, createdAction = false){
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )

    const subscription = await stripe.subscriptions.retrieve(subscritionId);

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

    if(createdAction){
        await fauna.query(
            q.Create(
                q.Collection('subscription'),
                { data: { teste: 'teste' } }
            )
        )
    }else{
        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscription.id
                        )
                    )
                ),
                { data: subscriptionData }
            )
        )
    }

}