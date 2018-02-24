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

Require Import String.
Require Import List.

Section Closure.
  (** Function closures over code [C] and types [T] *)
  
  Context {C:Set}.
  Context {T:Set}.

  (** Whether code is closed wrt to parameters *)
  Context {code_is_closed : list string -> C -> Prop}.

  Record closure :=
    { closure_params: list (string * option T);
      closure_output : option T;
      closure_body : C; }.

  Definition closure_is_closed (f:closure) : Prop :=
    code_is_closed (map fst f.(closure_params)) f.(closure_body).

  Definition closed_closure :=
    { c : closure | closure_is_closed c }.
  
End Closure.
