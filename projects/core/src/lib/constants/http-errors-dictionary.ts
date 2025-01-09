/*
 *
 *  * Copyright 2019-2023 HyperIoT
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License")
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *  *
 *
 */

export const ErrorMessageDefault = {
  title: $localize`:@@HYT_error:Error`,
  body: $localize`:@@HYT_something_wrong:Something's wrong`
}

export const HttpErrorsDictionary: {
    [index: number]: {
      title: string,
      body: string
    }
} = {
    401: {
      title: $localize`:@@HYT_authorization_error:Athorization error`,
      body: $localize`:@@HYT_you_do_not_have_sufficient_permissions_to_perform_this_operation:You do not have sufficient permissions to perform this operation`
    },
    403: {
      title: $localize`:@@HYT_authentication_error:Authentication error`,
      body: $localize`:@@HYT_you_do_not_have_sufficient_permissions_to_perform_this_operation:You do not have sufficient permissions to perform this operation`
    }
};
