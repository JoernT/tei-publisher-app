(:
 : Copyright 2015, Wolfgang Meier
 :
 : This software is dual-licensed:
 :
 : 1. Distributed under a Creative Commons Attribution-ShareAlike 3.0 Unported License
 : http://creativecommons.org/licenses/by-sa/3.0/
 :
 : 2. http://www.opensource.org/licenses/BSD-2-Clause
 :
 : All rights reserved. Redistribution and use in source and binary forms, with or without
 : modification, are permitted provided that the following conditions are met:
 :
 : * Redistributions of source code must retain the above copyright notice, this list of
 : conditions and the following disclaimer.
 : * Redistributions in binary form must reproduce the above copyright
 : notice, this list of conditions and the following disclaimer in the documentation
 : and/or other materials provided with the distribution.
 :
 : This software is provided by the copyright holders and contributors "as is" and any
 : express or implied warranties, including, but not limited to, the implied warranties
 : of merchantability and fitness for a particular purpose are disclaimed. In no event
 : shall the copyright holder or contributors be liable for any direct, indirect,
 : incidental, special, exemplary, or consequential damages (including, but not limited to,
 : procurement of substitute goods or services; loss of use, data, or profits; or business
 : interruption) however caused and on any theory of liability, whether in contract,
 : strict liability, or tort (including negligence or otherwise) arising in any way out
 : of the use of this software, even if advised of the possibility of such damage.
 :)
xquery version "3.1";

(:~
 : Template functions to handle search.
 :)
module namespace search="http://www.tei-c.org/tei-simple/search";

declare namespace tei="http://www.tei-c.org/ns/1.0";

import module namespace templates="http://exist-db.org/xquery/templates";
import module namespace kwic="http://exist-db.org/xquery/kwic" at "resource:org/exist/xquery/lib/kwic.xql";
import module namespace pages="http://www.tei-c.org/tei-simple/pages" at "pages.xql";
import module namespace app="http://www.tei-c.org/tei-simple/templates" at "app.xql";
import module namespace config="http://www.tei-c.org/tei-simple/config" at "config.xqm";

(:~
: Execute the query. The search results are not output immediately. Instead they
: are passed to nested templates through the $model parameter.
:
: @author Wolfgang M. Meier
: @author Jens Østergaard Petersen
: @param $node
: @param $model
: @param $query The query string. This string is transformed into a <query> element containing one or two <bool> elements in a Lucene query and it is transformed into a sequence of one or two query strings in an ngram query. The first <bool> and the first string contain the query as input and the second the query as transliterated into Devanagari or IAST as determined by $query-scripts. One <bool> and one query string may be empty.
: @param $index The index against which the query is to be performed, as the string "ngram" or "lucene".
: @param $lucene-query-mode If a Lucene query is performed, which of the options "any", "all", "phrase", "near-ordered", "near-unordered", "fuzzy", or "regex" have been selected (note that wildcard is not implemented, due to its syntactic overlap with regex).
: @param $tei-target A sequence of one or more targets within a TEI document, the tei:teiHeader or tei:text.
: @param $work-authors A sequence of the string "all" or of the xml:ids of the documents associated with the selected authors.
: @param $query-scripts A sequence of the string "all" or of the values "sa-Latn" or "sa-Deva", indicating whether or not the user wishes to transliterate the query string.
: @param $target-texts A sequence of the string "all" or of the xml:ids of the documents selected.

: @return The function returns a map containing the $hits, the $query, and the $query-scope. The search results are output through the nested templates, app:hit-count, app:paginate, and app:show-hits.
:)
declare
    %templates:default("lucene-query-mode", "any")
    %templates:default("tei-target", "tei-text")
    %templates:default("query-scope", "narrow")
    %templates:default("work-authors", "all")
    %templates:default("query-scripts", "all")
    %templates:default("target-texts", "all")
function search:query($node as node()*, $model as map(*), $query as xs:string?, $lucene-query-mode as xs:string, $tei-target as xs:string+, $query-scope as xs:string, $work-authors as xs:string+, $query-scripts as xs:string, $target-texts as xs:string+) as map(*) {
        (:If there is no query string, fill up the map with existing values:)
        if (empty($query))
        then
            map {
                "hits" := session:get-attribute("apps.simple"),
                "hitCount" := session:get-attribute("apps.simple.hitCount"),
                "query" := session:get-attribute("apps.simple.query"),
                "scope" := $query-scope (:NB: what about the other arguments?:)
            }
        else
            (:Otherwise, perform the query.:)
            (: Here the actual query commences. This is split into two parts, the first for a Lucene query and the second for an ngram query. :)
            (:The query passed to a Luecene query in ft:query is an XML element <query> containing one or two <bool>. The <bool> contain the original query and the transliterated query, as indicated by the user in $query-scripts.:)
            let $hits :=
                    (:If the $query-scope is narrow, query the elements immediately below the lowest div in tei:text and the four major element below tei:teiHeader.:)
                    for $hit in
                        (:If both tei-text and tei-header is queried.:)
                        if (count($tei-target) eq 2)
                        then
                            search:query-default($query) |
                            collection($config:data-root)//tei:head[ft:query(., $query)]
                        else
                            if ($tei-target = 'tei-text')
                            then
                                search:query-default($query)
                            else
                                if ($tei-target = 'tei-head')
                                then
                                    collection($config:data-root)//tei:head[ft:query(., $query)]
                                else ()
                    order by ft:score($hit) descending
                    return $hit
            let $hitCount := count($hits)
            let $hits := if ($hitCount > 1000) then subsequence($hits, 1, 1000) else $hits
            (:Store the result in the session.:)
            let $store := (
                session:set-attribute("apps.simple", $hits),
                session:set-attribute("apps.simple.hitCount", $hitCount),
                session:set-attribute("apps.simple.query", $query),
                session:set-attribute("apps.simple.scope", $query-scope)
                )
            return
                (: The hits are not returned directly, but processed by the nested templates :)
                map {
                    "hits" := $hits,
                    "hitCount" := $hitCount,
                    "query" := $query
                }
};

declare function search:query-default($query as xs:string) {
    switch ($config:search-default)
        case "tei:div" return
            collection($config:data-root)//tei:div[ft:query(., $query)][not(tei:div)]
        case "tei:body" return
            collection($config:data-root)//tei:body[ft:query(., $query)]
        default return
            util:eval("collection($config:data-root)//" || $config:search-default || "[ft:query(., $query)]")
};

declare function search:query-default-view($context as element()*, $query as xs:string) {
    switch ($config:search-default)
        case "tei:div" return
            $context[./descendant-or-self::tei:div[ft:query(., $query)]]
        case "tei:body" return
            $context[./descendant-or-self::tei:body[ft:query(., $query)]]
        default return
            util:eval("$context[./descendant-or-self::" || $config:search-default || "[ft:query(., $query)]]")
};


(:~
    Output the actual search result as a div, using the kwic module to summarize full text matches.
:)
declare
    %templates:wrap
    %templates:default("start", 1)
    %templates:default("per-page", 10)
function search:show-hits($node as node()*, $model as map(*), $start as xs:integer, $per-page as xs:integer, $view as xs:string?) {
    let $view := if ($view) then $view else $config:default-view
    for $hit at $p in subsequence($model("hits"), $start, $per-page)
    let $parent := ($hit/self::tei:body, $hit/ancestor-or-self::tei:div)[1]
    let $parent := if ($parent) then $parent else $hit/ancestor-or-self::tei:teiHeader
    let $div := search:get-current($parent)
    let $parent-id := util:document-name($parent) || "_" || util:node-id($parent)
    (:if the nearest div does not have an xml:id, find the nearest element with an xml:id and use it:)
    (:is this necessary - can't we just use the nearest ancestor?:)
(:    let $div-id := :)
(:        if ($div-id) :)
(:        then $div-id :)
(:        else ($hit/ancestor-or-self::*[@xml:id]/@xml:id)[1]/string():)
    (:if it is not a div, it will not have a head:)
    let $div-head := $parent/tei:head/text()
    (:TODO: what if the hit is in the header?:)
    let $work := $hit/ancestor::tei:TEI
    let $work-title := app:work-title($work)
    (:the work always has xml:id.:)
    let $work-id := $work/@xml:id/string()
    let $work-id := if ($work-id) then $work-id else util:document-name($work) || "_1"

    let $loc :=
        <tr class="reference">
            <td colspan="3">
                <span class="number">{$start + $p - 1}</span>
                <span class="headings">
                    <a href="{$work-id}">{$work-title}</a>{if ($div-head) then ' / ' else ''}<a href="{$parent-id}.html?action=search">{$div-head}</a>
                </span>
            </td>
        </tr>
    let $expanded := util:expand($hit, "add-exist-id=all")
    return (
        $loc,
        for $match in subsequence($expanded//exist:match, 1, 5)
        let $matchId := $match/../@exist:id
        let $docLink :=
            if ($view = "page") then
                let $contextNode := util:node-by-id($div, $matchId)
                let $page := $contextNode/preceding::tei:pb[1]
                return
                    config:get-relpath($work) || "_" || util:node-id($page)
            else
                config:get-relpath($div) || "_" || util:node-id($div)
        let $config := <config width="60" table="yes" link="{$docLink}.xml?action=search&amp;view={$view}#{$matchId}"/>
        let $kwic := kwic:get-summary($expanded, $match, $config)
        return $kwic
    )
};

declare %private function search:get-current($div as element()?) {
    if (empty($div)) then
        ()
    else
        if ($div instance of element(tei:teiHeader)) then
        $div
        else
            if (
                empty($div/preceding-sibling::tei:div)  (: first div in section :)
                and count($div/preceding-sibling::*) < 5 (: less than 5 elements before div :)
                and $div/.. instance of element(tei:div) (: parent is a div :)
            ) then
                pages:get-previous($div/..)
            else
                $div
};