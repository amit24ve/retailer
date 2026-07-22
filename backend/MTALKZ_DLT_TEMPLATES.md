# mTalkz DLT Templates To Create

Use Principle Entity ID `1105176881836987366` and Sender ID `AVOPAY`.
After approval, add the returned template IDs to `MTALKZ_TEMPLATE_IDS` in `.env`.

Example mapping:

```env
MTALKZ_TEMPLATE_IDS=campaign_offer:ID_HERE,campaign_info:ID_HERE,welcome_customer:ID_HERE,purchase_receipt:ID_HERE,points_update:ID_HERE,tier_upgrade:ID_HERE,birthday_offer:ID_HERE,anniversary_offer:ID_HERE,referral_invite:ID_HERE,qr_share:ID_HERE,feedback_request:ID_HERE,membership_update:ID_HERE
```

## Campaign Offer

Template key: `campaign_offer`

```text
Hi {#var#}, {#var#} has a special offer for you: {#var#}. Use code {#var#}. Visit us today. Best wishes AVOPAY.
```

## Campaign Information

Template key: `campaign_info`

```text
Hi {#var#}, update from {#var#}: {#var#}. Best wishes AVOPAY.
```

## Welcome Customer

Template key: `welcome_customer`

```text
Welcome to {#var#}, {#var#}. Your loyalty account is active. Tier: {#var#}. Referral code: {#var#}. Best wishes AVOPAY.
```

## Purchase Receipt

Template key: `purchase_receipt`

```text
Hi {#var#}, thanks for shopping at {#var#}. Bill amount Rs {#var#}. You earned {#var#} points. Best wishes AVOPAY.
```

## Points Update

Template key: `points_update`

```text
Hi {#var#}, your {#var#} points balance is {#var#} points. Keep shopping to unlock more rewards. Best wishes AVOPAY.
```

## Tier Upgrade

Template key: `tier_upgrade`

```text
Congratulations {#var#}. You are now a {#var#} member at {#var#}. Enjoy your upgraded benefits. Best wishes AVOPAY.
```

## Birthday Offer

Template key: `birthday_offer`

```text
Happy Birthday {#var#}. {#var#} has a special birthday offer for you: {#var#}. Valid for a limited time. Best wishes AVOPAY.
```

## Anniversary Offer

Template key: `anniversary_offer`

```text
Happy Anniversary {#var#}. {#var#} is celebrating with you. Enjoy {#var#} on your next visit. Best wishes AVOPAY.
```

## Referral Invite

Template key: `referral_invite`

```text
Hi {#var#}, invite your friend to {#var#}. Share this referral link or code: {#var#}. Rewards apply after signup. Best wishes AVOPAY.
```

## QR Share

Template key: `qr_share`

```text
Hi, here is your {#var#} QR link for {#var#}: {#var#}. Best wishes AVOPAY.
```

## Feedback Request

Template key: `feedback_request`

```text
Hi {#var#}, thanks for visiting {#var#}. Please share your feedback here: {#var#}. Best wishes AVOPAY.
```

## Membership Update

Template key: `membership_update`

```text
Hi {#var#}, your {#var#} membership {#var#} is active until {#var#}. Enjoy your benefits. Best wishes AVOPAY.
```
