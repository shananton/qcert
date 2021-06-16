(*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *)

Require Import List.
Require Import ZArith.
Require Import EquivDec.
Require Import RelationClasses.
Require Import Equivalence.
Require Import String.

Require Import Utils.
Require Import EJsonSystem.
Require Import ForeignData.
Require Import ForeignEJson.
Require Import SqlDateComponent.
Require Import UriComponent.

Require Import EnhancedData.

Import ListNotations.
Local Open Scope list_scope.

Parameter enhanced_wson : Set.
Extract Constant enhanced_wson => "string".
Axiom enhanced_wson_eqdec : forall x y : enhanced_wson, {x = y} + {x = y -> False}.
Axiom enhanced_wson_normalized : forall x : enhanced_wson, Prop.
Axiom enhanced_wson_normalize : enhanced_wson -> enhanced_wson.
Axiom enhanced_wson_normalize_normalized : forall x : enhanced_wson, enhanced_wson_normalized (enhanced_wson_normalize x).
Axiom enhanced_wson_normalize_idempotent : forall x : enhanced_wson, enhanced_wson_normalized x -> enhanced_wson_normalize x = x.
Axiom enhanced_wson_to_string : enhanced_wson -> string.

Program Instance enhanced_foreign_wson : foreign_ejson enhanced_wson
  := mk_foreign_ejson enhanced_wson _ _ enhanced_wson_normalize _ _ _.
Next Obligation.
  red.
  unfold equiv, complement.
  apply enhanced_wson_eqdec.
Defined.
Next Obligation.
  apply (enhanced_wson_normalized a).
Defined.
Next Obligation.
  unfold enhanced_foreign_wson_obligation_2.
  apply (enhanced_wson_normalize_normalized a).
Defined.
Next Obligation.
  unfold enhanced_foreign_wson_obligation_2 in H.
  apply enhanced_wson_normalize_idempotent.
  assumption.
Defined.
Next Obligation.
  constructor.
  apply enhanced_wson_to_string.
Defined.
