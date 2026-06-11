-- Restreindre les soumissions aux adresses @stu-lisaa.com

-- Adhésions clubs
alter table club_join_requests
  add constraint mail_stu_lisaa
  check (mail ilike '%@stu-lisaa.com');

-- Commandes shop
alter table shop_orders
  add constraint mail_stu_lisaa
  check (mail ilike '%@stu-lisaa.com');

-- Suggestions (optionnel, null autorisé)
alter table suggestions
  add constraint mail_stu_lisaa
  check (mail is null or mail ilike '%@stu-lisaa.com');
