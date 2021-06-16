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
Require Import Utils.
Require Import EJsonRuntime.
Require Import WSONRuntime.
Require Import ForeignEJsonToWSON.

Section EJsonToWSON.
  Context {foreign_ejson_model:Set}.
  Context {foreign_wson_model:Set}.
  Context {ftowson:foreign_to_wson foreign_ejson_model foreign_wson_model}.

  Section toWSON.
    (* EJson to WSON *)
    Fixpoint ejson_to_wson (j:ejson) : wson :=
      match j with
      | ejnull => ejnull
      | ejnumber n => ejnumber n
      | ejbigint n => ejbigint n
      | ejbool b => ejbool b
      | ejstring s => ejstring s
      | ejarray c => ejarray (map ejson_to_wson c)
      | ejobject r => ejobject (map (fun x => (fst x, ejson_to_wson (snd x))) r)
      | ejforeign fd => ejforeign (foreign_to_wson_from_ejson fd)
      end.
  End toWSON.

  Section fromWSON.
    (* EJson to WSON *)
    Fixpoint wson_to_ejson (j:wson) : ejson :=
      match j with
      | ejnull => ejnull
      | ejnumber n => ejnumber n
      | ejbigint n => ejbigint n
      | ejbool b => ejbool b
      | ejstring s => ejstring s
      | ejarray c => ejarray (map wson_to_ejson c)
      | ejobject r => ejobject (map (fun x => (fst x, wson_to_ejson (snd x))) r)
      | ejforeign fd => ejforeign (foreign_to_wson_to_ejson fd)
      end.
  End fromWSON.

End EJsonToWSON.
