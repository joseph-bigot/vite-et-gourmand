--
-- PostgreSQL database dump
--

\restrict m7YP4QAbJpOn0c5WuaSBgCs2Vdo4fsRHW3A6TJU8JAGKE6TcOAgTtacTNaWmbhU

-- Dumped from database version 17.11 (Debian 17.11-1.pgdg13+2)
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: allergene; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.allergene (
    id_allergene bigint NOT NULL,
    nom character varying(100) NOT NULL
);


ALTER TABLE public.allergene OWNER TO vite_admin;

--
-- Name: allergene_id_allergene_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.allergene ALTER COLUMN id_allergene ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.allergene_id_allergene_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: avis; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.avis (
    id_avis bigint NOT NULL,
    id_commande bigint NOT NULL,
    note smallint NOT NULL,
    commentaire text NOT NULL,
    statut_validation character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    date_creation timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT avis_note_check CHECK (((note >= 1) AND (note <= 5))),
    CONSTRAINT avis_statut_validation_check CHECK (((statut_validation)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE public.avis OWNER TO vite_admin;

--
-- Name: avis_id_avis_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.avis ALTER COLUMN id_avis ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.avis_id_avis_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: commande; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.commande (
    id_commande bigint NOT NULL,
    id_utilisateur bigint NOT NULL,
    id_menu bigint NOT NULL,
    date_commande timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_prestation date NOT NULL,
    heure_prestation time without time zone NOT NULL,
    adresse_livraison text NOT NULL,
    lieu_prestation character varying(255) NOT NULL,
    nombre_personnes integer NOT NULL,
    prix_menu numeric(10,2) NOT NULL,
    montant_reduction numeric(10,2) DEFAULT 0 NOT NULL,
    frais_livraison numeric(10,2) DEFAULT 0 NOT NULL,
    prix_total numeric(10,2) NOT NULL,
    motif_annulation text,
    moyen_contact_annulation character varying(50),
    date_limite_retour_materiel date,
    date_retour_materiel date,
    distance_km numeric(10,2) DEFAULT 0 NOT NULL,
    livraison_hors_bordeaux boolean DEFAULT false NOT NULL,
    pret_materiel boolean DEFAULT false NOT NULL,
    CONSTRAINT commande_check CHECK (((date_retour_materiel IS NULL) OR (date_limite_retour_materiel IS NULL) OR (date_retour_materiel >= date_prestation))),
    CONSTRAINT commande_frais_livraison_check CHECK ((frais_livraison >= (0)::numeric)),
    CONSTRAINT commande_montant_reduction_check CHECK ((montant_reduction >= (0)::numeric)),
    CONSTRAINT commande_nombre_personnes_check CHECK ((nombre_personnes > 0)),
    CONSTRAINT commande_prix_menu_check CHECK ((prix_menu >= (0)::numeric)),
    CONSTRAINT commande_prix_total_check CHECK ((prix_total >= (0)::numeric))
);


ALTER TABLE public.commande OWNER TO vite_admin;

--
-- Name: commande_id_commande_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.commande ALTER COLUMN id_commande ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.commande_id_commande_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: composer_menu; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.composer_menu (
    id_menu bigint NOT NULL,
    id_plat bigint NOT NULL,
    quantite integer DEFAULT 1 NOT NULL,
    ordre_affichage integer DEFAULT 1 NOT NULL,
    CONSTRAINT composer_menu_ordre_affichage_check CHECK ((ordre_affichage > 0)),
    CONSTRAINT composer_menu_quantite_check CHECK ((quantite > 0))
);


ALTER TABLE public.composer_menu OWNER TO vite_admin;

--
-- Name: contact; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.contact (
    id_contact bigint NOT NULL,
    nom character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    sujet character varying(200) NOT NULL,
    message text NOT NULL,
    date_envoi timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.contact OWNER TO vite_admin;

--
-- Name: contact_id_contact_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.contact ALTER COLUMN id_contact ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contact_id_contact_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: historique_statut; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.historique_statut (
    id_historique bigint NOT NULL,
    id_commande bigint NOT NULL,
    statut character varying(40) NOT NULL,
    date_changement timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT historique_statut_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'acceptee'::character varying, 'refusee'::character varying, 'en_preparation'::character varying, 'en_livraison'::character varying, 'livree'::character varying, 'attente_retour_materiel'::character varying, 'terminee'::character varying, 'annulee'::character varying])::text[])))
);


ALTER TABLE public.historique_statut OWNER TO vite_admin;

--
-- Name: historique_statut_id_historique_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.historique_statut ALTER COLUMN id_historique ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.historique_statut_id_historique_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: horaire; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.horaire (
    id_horaire bigint NOT NULL,
    jour_semaine smallint NOT NULL,
    heure_ouverture time without time zone,
    heure_fermeture time without time zone,
    ferme boolean DEFAULT false NOT NULL,
    CONSTRAINT horaire_check CHECK (((ferme = true) OR ((heure_ouverture IS NOT NULL) AND (heure_fermeture IS NOT NULL) AND (heure_fermeture > heure_ouverture)))),
    CONSTRAINT horaire_jour_semaine_check CHECK (((jour_semaine >= 1) AND (jour_semaine <= 7)))
);


ALTER TABLE public.horaire OWNER TO vite_admin;

--
-- Name: horaire_id_horaire_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.horaire ALTER COLUMN id_horaire ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.horaire_id_horaire_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: image_menu; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.image_menu (
    id_image bigint NOT NULL,
    id_menu bigint NOT NULL,
    chemin_image text NOT NULL,
    texte_alternatif character varying(255) NOT NULL,
    ordre_affichage integer DEFAULT 1 NOT NULL,
    CONSTRAINT image_menu_ordre_affichage_check CHECK ((ordre_affichage > 0))
);


ALTER TABLE public.image_menu OWNER TO vite_admin;

--
-- Name: image_menu_id_image_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.image_menu ALTER COLUMN id_image ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.image_menu_id_image_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: menu; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.menu (
    id_menu bigint NOT NULL,
    id_theme bigint NOT NULL,
    id_regime bigint NOT NULL,
    titre character varying(150) NOT NULL,
    description text NOT NULL,
    prix_par_personne numeric(10,2) NOT NULL,
    nombre_minimum_personnes integer NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    conditions_commande text NOT NULL,
    conditions_conservation text NOT NULL,
    disponible boolean DEFAULT true NOT NULL,
    date_creation timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT menu_nombre_minimum_personnes_check CHECK ((nombre_minimum_personnes > 0)),
    CONSTRAINT menu_prix_par_personne_check CHECK ((prix_par_personne >= (0)::numeric)),
    CONSTRAINT menu_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.menu OWNER TO vite_admin;

--
-- Name: menu_id_menu_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.menu ALTER COLUMN id_menu ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.menu_id_menu_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plat; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.plat (
    id_plat bigint NOT NULL,
    nom character varying(150) NOT NULL,
    description text,
    categorie character varying(20) NOT NULL,
    CONSTRAINT plat_categorie_check CHECK (((categorie)::text = ANY ((ARRAY['entree'::character varying, 'plat'::character varying, 'dessert'::character varying])::text[])))
);


ALTER TABLE public.plat OWNER TO vite_admin;

--
-- Name: plat_allergene; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.plat_allergene (
    id_plat bigint NOT NULL,
    id_allergene bigint NOT NULL
);


ALTER TABLE public.plat_allergene OWNER TO vite_admin;

--
-- Name: plat_id_plat_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.plat ALTER COLUMN id_plat ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.plat_id_plat_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: regime_alimentaire; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.regime_alimentaire (
    id_regime bigint NOT NULL,
    nom character varying(100) NOT NULL
);


ALTER TABLE public.regime_alimentaire OWNER TO vite_admin;

--
-- Name: regime_alimentaire_id_regime_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.regime_alimentaire ALTER COLUMN id_regime ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.regime_alimentaire_id_regime_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: theme; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.theme (
    id_theme bigint NOT NULL,
    nom character varying(100) NOT NULL
);


ALTER TABLE public.theme OWNER TO vite_admin;

--
-- Name: theme_id_theme_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.theme ALTER COLUMN id_theme ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.theme_id_theme_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: vite_admin
--

CREATE TABLE public.utilisateur (
    id_utilisateur bigint NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    telephone character varying(20),
    email character varying(255) NOT NULL,
    adresse text,
    mot_de_passe_hash text NOT NULL,
    role character varying(20) DEFAULT 'client'::character varying NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    date_creation timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reset_password_token_hash character varying(64),
    reset_password_expires_at timestamp with time zone,
    CONSTRAINT utilisateur_role_check CHECK (((role)::text = ANY ((ARRAY['client'::character varying, 'employe'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.utilisateur OWNER TO vite_admin;

--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE; Schema: public; Owner: vite_admin
--

ALTER TABLE public.utilisateur ALTER COLUMN id_utilisateur ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.utilisateur_id_utilisateur_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: allergene; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.allergene (id_allergene, nom) FROM stdin;
1	Gluten
2	Lait
3	Œufs
4	Fruits à coque
5	Soja
\.


--
-- Data for Name: avis; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.avis (id_avis, id_commande, note, commentaire, statut_validation, date_creation) FROM stdin;
1	5	5	service top	approuve	2026-10-27 14:04:43.592089+00
2	2	5	je recommande	rejete	2026-10-27 14:18:48.366179+00
\.


--
-- Data for Name: commande; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.commande (id_commande, id_utilisateur, id_menu, date_commande, date_prestation, heure_prestation, adresse_livraison, lieu_prestation, nombre_personnes, prix_menu, montant_reduction, frais_livraison, prix_total, motif_annulation, moyen_contact_annulation, date_limite_retour_materiel, date_retour_materiel, distance_km, livraison_hors_bordeaux, pret_materiel) FROM stdin;
4	10	2	2026-10-23 09:02:46.466014+00	2026-10-30	12:30:00	201 avenue de la resistance, 83000 toulon	TOULON	10	450.00	0.00	5.00	455.00	delai	0786762264	\N	\N	10.00	t	f
5	10	1	2026-10-26 07:53:19.704279+00	2026-11-19	12:45:00	1 rue artas, 83100 toulon	Ollioules	10	350.00	0.00	5.00	355.00	\N	\N	\N	\N	0.00	f	f
2	10	1	2026-10-23 07:22:47.15329+00	2026-11-15	12:00:00	Adresse fictive de test	Domicile	10	350.00	0.00	0.00	350.00	\N	\N	\N	\N	0.00	f	f
3	10	1	2026-10-23 07:26:12.771507+00	2026-11-28	12:00:00	Adresse fictive de test	Domicile	10	350.00	0.00	0.00	350.00	Commande refusée pour indisponibilité exceptionnelle.	telephone	\N	\N	0.00	f	f
6	10	2	2026-11-03 17:20:26.277946+00	2026-12-24	12:00:00	10 rue de la republique, 33400 Bordeaux	salle des fêtes	11	495.00	0.00	16.80	511.80	pb personnel	0786762264	\N	\N	20.00	t	f
7	10	1	2026-11-04 08:07:54.793038+00	2026-12-20	12:00:00	12 rue des Saveurs, Bordeaux	Domicile	10	350.00	0.00	5.00	355.00	Annulation de commande de test	email	\N	\N	0.00	f	f
8	10	1	2026-11-04 08:18:32.572946+00	2026-12-22	12:00:00	12 rue des Saveurs, Bordeaux	Domicile	10	350.00	0.00	5.00	355.00	\N	\N	\N	\N	0.00	f	f
\.


--
-- Data for Name: composer_menu; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.composer_menu (id_menu, id_plat, quantite, ordre_affichage) FROM stdin;
1	1	1	1
3	1	1	1
2	2	1	1
1	3	1	2
2	3	1	2
3	4	1	2
2	5	1	3
1	6	1	3
3	6	1	3
\.


--
-- Data for Name: contact; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.contact (id_contact, nom, email, sujet, message, date_envoi) FROM stdin;
\.


--
-- Data for Name: historique_statut; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.historique_statut (id_historique, id_commande, statut, date_changement) FROM stdin;
1	2	en_attente	2026-10-23 07:22:47.15329+00
2	3	en_attente	2026-10-23 07:26:12.771507+00
3	4	en_attente	2026-10-23 09:02:46.466014+00
4	4	annulee	2026-10-23 09:59:49.651792+00
5	5	en_attente	2026-10-26 07:53:19.704279+00
6	5	acceptee	2026-10-27 08:00:36.410613+00
7	5	en_preparation	2026-10-27 08:09:54.043738+00
8	3	refusee	2026-10-27 08:18:44.694732+00
9	2	acceptee	2026-10-27 08:31:46.217489+00
10	5	en_livraison	2026-10-27 08:34:52.564889+00
11	5	livree	2026-10-27 08:39:03.324733+00
12	2	en_preparation	2026-10-27 08:39:13.653185+00
13	2	en_livraison	2026-10-27 12:58:52.164581+00
14	5	attente_retour_materiel	2026-10-27 14:03:37.296315+00
15	5	terminee	2026-10-27 14:03:42.496284+00
16	2	livree	2026-10-27 14:18:21.400611+00
17	2	attente_retour_materiel	2026-10-27 14:18:25.220653+00
18	2	terminee	2026-10-27 14:18:28.645794+00
19	6	en_attente	2026-11-03 17:20:26.277946+00
20	6	annulee	2026-11-03 17:33:32.392917+00
21	7	en_attente	2026-11-04 08:07:54.793038+00
22	7	annulee	2026-11-04 08:15:33.068642+00
23	8	en_attente	2026-11-04 08:18:32.572946+00
24	8	acceptee	2026-11-04 08:18:55.370175+00
25	8	en_preparation	2026-11-04 08:19:49.285979+00
26	8	en_livraison	2026-11-04 08:20:21.084222+00
27	8	livree	2026-11-04 08:20:49.063835+00
28	8	attente_retour_materiel	2026-11-04 08:21:22.102436+00
29	8	terminee	2026-11-04 08:21:41.946876+00
\.


--
-- Data for Name: horaire; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.horaire (id_horaire, jour_semaine, heure_ouverture, heure_fermeture, ferme) FROM stdin;
1	1	09:00:00	18:00:00	f
2	2	09:00:00	18:00:00	f
3	3	09:00:00	18:00:00	f
4	4	09:00:00	18:00:00	f
5	5	09:00:00	18:00:00	f
6	6	09:00:00	18:00:00	f
7	7	09:00:00	18:00:00	f
\.


--
-- Data for Name: image_menu; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.image_menu (id_image, id_menu, chemin_image, texte_alternatif, ordre_affichage) FROM stdin;
\.


--
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.menu (id_menu, id_theme, id_regime, titre, description, prix_par_personne, nombre_minimum_personnes, stock, conditions_commande, conditions_conservation, disponible, date_creation) FROM stdin;
2	2	1	Menu Festif	Un menu conçu pour les repas de fête et les grandes occasions.	45.00	10	5	Commande à confirmer selon les disponibilités.	Conserver les préparations selon les consignes communiquées.	t	2026-10-20 09:05:23.949405+00
3	1	2	Menu Végétarien	Un menu végétarien autour des légumes et des produits de saison.	32.00	10	5	Commande à confirmer selon les disponibilités.	Conserver les préparations selon les consignes communiquées.	t	2026-10-20 09:05:23.949405+00
1	1	1	Menu Classique	Un menu traditionnel composé de produits de saison.	35.00	10	4	Commande à confirmer selon les disponibilités.	Conserver les préparations selon les consignes communiquées.	f	2026-10-20 09:05:23.949405+00
\.


--
-- Data for Name: plat; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.plat (id_plat, nom, description, categorie) FROM stdin;
1	Velouté de saison	Velouté préparé avec des légumes de saison.	entree
2	Feuilleté aux légumes	Feuilleté garni de légumes de saison.	entree
3	Suprême de volaille	Volaille accompagnée de légumes rôtis.	plat
4	Risotto aux champignons	Risotto crémeux aux champignons.	plat
5	Fondant au chocolat	Dessert au chocolat.	dessert
6	Tarte aux fruits	Tarte garnie de fruits de saison.	dessert
7	omelette		plat
\.


--
-- Data for Name: plat_allergene; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.plat_allergene (id_plat, id_allergene) FROM stdin;
2	1
6	1
3	2
5	2
5	3
7	3
\.


--
-- Data for Name: regime_alimentaire; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.regime_alimentaire (id_regime, nom) FROM stdin;
1	Classique
2	Végétarien
4	Sans gluten
\.


--
-- Data for Name: theme; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.theme (id_theme, nom) FROM stdin;
1	Classique
2	Événement
4	Noël
5	Pâques
\.


--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: vite_admin
--

COPY public.utilisateur (id_utilisateur, nom, prenom, telephone, email, adresse, mot_de_passe_hash, role, actif, date_creation, reset_password_token_hash, reset_password_expires_at) FROM stdin;
10	BIGOT	JOSEPH	0786762264	jos02215@gmail.com	\N	$2b$12$8jInFOJ2imNUetrlUQTnEuY56Dyyfb63.Q.YXmecPXWVtKsKqGQVm	client	t	2026-10-22 11:53:44.093896+00	\N	\N
12	ADMIN	Administration	\N	admin@vite-gourmand.fr	\N	$2b$12$/FnpQAgbhE0p4bBFumFt4.xwCYILi4WEd35hbcfBnGdmel6L/l/uW	admin	t	2026-10-27 10:13:08.34041+00	\N	\N
11	EMPLOYE	Test	\N	employe@vite-gourmand.fr	\N	$2b$12$iYAVsn6W/VYJ.Sa6z.j04OKUBfI0NnVFDXRfjZXHNZAhkT9jGwRFW	employe	t	2026-10-27 07:39:04.442073+00	\N	\N
13	employe2	prenom	\N	employe2@vite-gourmand.fr	\N	$2b$12$ClTov5QUdbQKwqWTF4GpjeiBI0eGvVZtj7kyMiR5JCd1NZA12Ljaa	employe	t	2026-10-27 10:30:50.740187+00	\N	\N
15	BIGOT	JOSEPH	0787965433	bigotrosalie@gmail.com	\N	$2b$12$3jDiQUfDcKwSCxvv0OfC/.mWE53/Iv5Ze/EtQmEKK.xK1.o3SMD7K	client	t	2026-11-04 07:22:14.004978+00	\N	\N
16		Test	\N	test-invalide@example.com	\N	$2b$12$Jr2U/X2i0vHqXicodRJSMO39Cey4FaQ2f/cuYqv53UYO7h0o31UCq	client	t	2026-11-04 07:31:38.378184+00	\N	\N
14	jos	test	\N	jos2215@gmail.com	\N	$2b$12$6dvNLMfRkGbI6KVPKo3SSO/72fKaBBKBH5iwQC8oWxvNmAHQyAP6q	employe	t	2026-10-27 13:37:18.95774+00	\N	\N
\.


--
-- Name: allergene_id_allergene_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.allergene_id_allergene_seq', 5, true);


--
-- Name: avis_id_avis_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.avis_id_avis_seq', 2, true);


--
-- Name: commande_id_commande_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.commande_id_commande_seq', 8, true);


--
-- Name: contact_id_contact_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.contact_id_contact_seq', 1, false);


--
-- Name: historique_statut_id_historique_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.historique_statut_id_historique_seq', 29, true);


--
-- Name: horaire_id_horaire_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.horaire_id_horaire_seq', 91, true);


--
-- Name: image_menu_id_image_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.image_menu_id_image_seq', 1, false);


--
-- Name: menu_id_menu_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.menu_id_menu_seq', 3, true);


--
-- Name: plat_id_plat_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.plat_id_plat_seq', 7, true);


--
-- Name: regime_alimentaire_id_regime_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.regime_alimentaire_id_regime_seq', 4, true);


--
-- Name: theme_id_theme_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.theme_id_theme_seq', 5, true);


--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE SET; Schema: public; Owner: vite_admin
--

SELECT pg_catalog.setval('public.utilisateur_id_utilisateur_seq', 16, true);


--
-- Name: allergene allergene_nom_key; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.allergene
    ADD CONSTRAINT allergene_nom_key UNIQUE (nom);


--
-- Name: allergene allergene_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.allergene
    ADD CONSTRAINT allergene_pkey PRIMARY KEY (id_allergene);


--
-- Name: avis avis_id_commande_key; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_id_commande_key UNIQUE (id_commande);


--
-- Name: avis avis_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_pkey PRIMARY KEY (id_avis);


--
-- Name: commande commande_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.commande
    ADD CONSTRAINT commande_pkey PRIMARY KEY (id_commande);


--
-- Name: composer_menu composer_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.composer_menu
    ADD CONSTRAINT composer_menu_pkey PRIMARY KEY (id_menu, id_plat);


--
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id_contact);


--
-- Name: historique_statut historique_statut_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.historique_statut
    ADD CONSTRAINT historique_statut_pkey PRIMARY KEY (id_historique);


--
-- Name: horaire horaire_jour_semaine_key; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.horaire
    ADD CONSTRAINT horaire_jour_semaine_key UNIQUE (jour_semaine);


--
-- Name: horaire horaire_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.horaire
    ADD CONSTRAINT horaire_pkey PRIMARY KEY (id_horaire);


--
-- Name: image_menu image_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.image_menu
    ADD CONSTRAINT image_menu_pkey PRIMARY KEY (id_image);


--
-- Name: menu menu_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id_menu);


--
-- Name: plat_allergene plat_allergene_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.plat_allergene
    ADD CONSTRAINT plat_allergene_pkey PRIMARY KEY (id_plat, id_allergene);


--
-- Name: plat plat_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.plat
    ADD CONSTRAINT plat_pkey PRIMARY KEY (id_plat);


--
-- Name: regime_alimentaire regime_alimentaire_nom_key; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.regime_alimentaire
    ADD CONSTRAINT regime_alimentaire_nom_key UNIQUE (nom);


--
-- Name: regime_alimentaire regime_alimentaire_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.regime_alimentaire
    ADD CONSTRAINT regime_alimentaire_pkey PRIMARY KEY (id_regime);


--
-- Name: theme theme_nom_key; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.theme
    ADD CONSTRAINT theme_nom_key UNIQUE (nom);


--
-- Name: theme theme_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.theme
    ADD CONSTRAINT theme_pkey PRIMARY KEY (id_theme);


--
-- Name: utilisateur utilisateur_email_key; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_email_key UNIQUE (email);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id_utilisateur);


--
-- Name: idx_commande_date_prestation; Type: INDEX; Schema: public; Owner: vite_admin
--

CREATE INDEX idx_commande_date_prestation ON public.commande USING btree (date_prestation);


--
-- Name: idx_commande_menu; Type: INDEX; Schema: public; Owner: vite_admin
--

CREATE INDEX idx_commande_menu ON public.commande USING btree (id_menu);


--
-- Name: idx_commande_utilisateur; Type: INDEX; Schema: public; Owner: vite_admin
--

CREATE INDEX idx_commande_utilisateur ON public.commande USING btree (id_utilisateur);


--
-- Name: idx_historique_commande_date; Type: INDEX; Schema: public; Owner: vite_admin
--

CREATE INDEX idx_historique_commande_date ON public.historique_statut USING btree (id_commande, date_changement DESC);


--
-- Name: idx_menu_filtres; Type: INDEX; Schema: public; Owner: vite_admin
--

CREATE INDEX idx_menu_filtres ON public.menu USING btree (id_theme, id_regime, prix_par_personne, disponible);


--
-- Name: idx_utilisateur_reset_password_token_hash; Type: INDEX; Schema: public; Owner: vite_admin
--

CREATE INDEX idx_utilisateur_reset_password_token_hash ON public.utilisateur USING btree (reset_password_token_hash) WHERE (reset_password_token_hash IS NOT NULL);


--
-- Name: avis avis_id_commande_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_id_commande_fkey FOREIGN KEY (id_commande) REFERENCES public.commande(id_commande);


--
-- Name: commande commande_id_menu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.commande
    ADD CONSTRAINT commande_id_menu_fkey FOREIGN KEY (id_menu) REFERENCES public.menu(id_menu);


--
-- Name: commande commande_id_utilisateur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.commande
    ADD CONSTRAINT commande_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) REFERENCES public.utilisateur(id_utilisateur);


--
-- Name: composer_menu composer_menu_id_menu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.composer_menu
    ADD CONSTRAINT composer_menu_id_menu_fkey FOREIGN KEY (id_menu) REFERENCES public.menu(id_menu) ON DELETE CASCADE;


--
-- Name: composer_menu composer_menu_id_plat_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.composer_menu
    ADD CONSTRAINT composer_menu_id_plat_fkey FOREIGN KEY (id_plat) REFERENCES public.plat(id_plat);


--
-- Name: historique_statut historique_statut_id_commande_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.historique_statut
    ADD CONSTRAINT historique_statut_id_commande_fkey FOREIGN KEY (id_commande) REFERENCES public.commande(id_commande) ON DELETE CASCADE;


--
-- Name: image_menu image_menu_id_menu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.image_menu
    ADD CONSTRAINT image_menu_id_menu_fkey FOREIGN KEY (id_menu) REFERENCES public.menu(id_menu) ON DELETE CASCADE;


--
-- Name: menu menu_id_regime_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_id_regime_fkey FOREIGN KEY (id_regime) REFERENCES public.regime_alimentaire(id_regime);


--
-- Name: menu menu_id_theme_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_id_theme_fkey FOREIGN KEY (id_theme) REFERENCES public.theme(id_theme);


--
-- Name: plat_allergene plat_allergene_id_allergene_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.plat_allergene
    ADD CONSTRAINT plat_allergene_id_allergene_fkey FOREIGN KEY (id_allergene) REFERENCES public.allergene(id_allergene);


--
-- Name: plat_allergene plat_allergene_id_plat_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vite_admin
--

ALTER TABLE ONLY public.plat_allergene
    ADD CONSTRAINT plat_allergene_id_plat_fkey FOREIGN KEY (id_plat) REFERENCES public.plat(id_plat) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict m7YP4QAbJpOn0c5WuaSBgCs2Vdo4fsRHW3A6TJU8JAGKE6TcOAgTtacTNaWmbhU

